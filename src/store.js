/**
 * store.js — State management + persistensi localStorage (M6).
 * Semua akses localStorage dibungkus try/catch sesuai SPEC.md R1 / NFR4.
 * Mutasi kostum selalu lewat satu fungsi `commit()` agar tidak ada yang
 * terlewat dari penyimpanan (T6.3).
 */
import {
  FILTER_DEFAULT,
  KATEGORI,
  PRODUK_SEED,
  STATUS,
  UKURAN,
  filterProducts,
} from './products.js';

/** Key kanonik M6. Key lama M1–M5 tetap dibaca sekali untuk migrasi. */
export const STORAGE_KEY = 'costestant:costumes:v1';
const LEGACY_KEY = 'costestant.kostum.v1';
const META_KEY = 'costestant.meta.v1';

const STORAGE_WARNING =
  'PENYIMPANAN LOKAL TIDAK TERSEDIA; PERUBAHAN HANYA SESI INI.';

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

  if (typeof item.id !== 'string' || item.id.trim() === '') push('id', 'STRING TIDAK KOSONG');
  if (typeof item.nama !== 'string' || item.nama.trim() === '') push('nama', 'STRING TIDAK KOSONG');
  if (typeof item.asal !== 'string' || item.asal.trim() === '') push('asal', 'STRING TIDAK KOSONG');
  if (!KATEGORI.includes(item.kategori)) push('kategori', 'ENUM TIDAK VALID');
  if (!UKURAN.includes(item.ukuran)) push('ukuran', 'ENUM TIDAK VALID');
  if (
    typeof item.hargaPer2Hari !== 'number' ||
    Number.isNaN(item.hargaPer2Hari) ||
    !Number.isFinite(item.hargaPer2Hari) ||
    item.hargaPer2Hari < 0
  ) {
    push('hargaPer2Hari', 'NUMBER VALID ≥ 0');
  }
  if (!Number.isInteger(item.stok) || item.stok < 0) push('stok', 'INTEGER ≥ 0');
  if (!STATUS.includes(item.status)) push('status', 'ENUM TIDAK VALID');
  if (typeof item.deskripsi !== 'string') push('deskripsi', 'HARUS STRING');
  if (typeof item.imageUrl !== 'string') push('imageUrl', 'HARUS STRING');
  if (typeof item.unggulan !== 'boolean') push('unggulan', 'HARUS BOOLEAN');
  return errors;
}

/** Validator satu kostum — true hanya jika seluruh field wajib lolos. */
export function validateCostumeItem(item) {
  return itemErrors(item).length === 0;
}

/** Validasi seluruh array + pesan spesifik (untuk banner import). */
export function validateCostumeListDetailed(list) {
  if (!Array.isArray(list)) return { valid: false, errors: ['DATA BUKAN ARRAY.'] };
  if (list.length === 0) return { valid: false, errors: ['ARRAY KOSTUM KOSONG.'] };

  const errors = [];
  const seen = new Set();
  list.forEach((item, index) => {
    const prefix = `ITEM ${index + 1} — `;
    errors.push(...itemErrors(item, prefix));
    if (item && typeof item === 'object' && typeof item.id === 'string') {
      if (seen.has(item.id)) errors.push(`${prefix}id: DUPLIKAT.`);
      seen.add(item.id);
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

  products = parsed.map((item) => ({ ...item }));
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
  return commit(Array.isArray(next) ? next : products);
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
  return commit([...products, product]);
}

export function updateProduct(id, patch) {
  return commit(products.map((item) => (item.id === id ? { ...item, ...patch } : item)));
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
  let parsed = null;
  try {
    parsed = JSON.parse(String(raw ?? '').replace(/^\uFEFF/, ''));
  } catch {
    return { ok: false, error: 'GAGAL IMPORT: ISI FILE BUKAN JSON YANG VALID.' };
  }

  const check = validateCostumeListDetailed(parsed);
  if (!check.valid) {
    const detail = check.errors.slice(0, 3).join(' ');
    return { ok: false, error: `GAGAL IMPORT: ${detail}` };
  }

  commit(parsed.map((item) => ({ ...item })));
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
