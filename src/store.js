/**
 * store.js — State management ringan + helper localStorage.
 * Milestone 1: kerangka. Semua akses localStorage dibungkus try/catch
 * sesuai SPEC.md R1 / NFR4 (fallback in-memory saat storage gagal).
 */
import { FILTER_DEFAULT, PRODUK_SEED, filterProducts } from './products.js';

const STORAGE_KEY = 'costestant.kostum.v1';
const META_KEY = 'costestant.meta.v1';

let products = cloneSeed();
let criteria = { ...FILTER_DEFAULT };
let storageAvailable = true;
const listeners = new Set();

function cloneSeed() {
  return PRODUK_SEED.map((item) => ({ ...item }));
}

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
  }
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

/** Muat data dari localStorage; auto-reseed bila kosong/rusak/bukan array. */
export function initStore() {
  storageAvailable = hasStorage();
  if (!storageAvailable) {
    products = cloneSeed();
    return products;
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      products = cloneSeed();
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
      writeMeta();
      return products;
    }

    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) {
      throw new Error('Data kostum tidak valid');
    }
    products = parsed;
    return products;
  } catch {
    products = cloneSeed();
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
    } catch {
      storageAvailable = false;
    }
    writeMeta();
    return products;
  }
}

export function getProducts() {
  return products;
}

export function getStorageStatus() {
  return storageAvailable;
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

/** Simpan array ke state + localStorage, lalu beri tahu subscriber. */
export function saveProducts(next) {
  if (Array.isArray(next)) products = next;
  if (storageAvailable) {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
    } catch {
      storageAvailable = false;
    }
  }
  notify();
  return storageAvailable;
}

/** Kembalikan seluruh katalog ke 8 data awal. */
export function resetProducts() {
  products = cloneSeed();
  if (storageAvailable) {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
      writeMeta();
    } catch {
      storageAvailable = false;
    }
  }
  notify();
  return products;
}

/* Helper mutasi kerangka untuk milestone berikutnya. */
export function addProduct(item) {
  return saveProducts([...products, item]);
}

export function updateProduct(id, patch) {
  return saveProducts(products.map((item) => (item.id === id ? { ...item, ...patch } : item)));
}

export function deleteProduct(id) {
  return saveProducts(products.filter((item) => item.id !== id));
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
