/**
 * main.js — Entry point aplikasi Costestant.
 * Menghubungkan style.css, store.js, dan ui.js serta routing 2 tab sederhana.
 */
import './style.css';
import {
  MAX_IMPORT_BYTES,
  initStore,
  getProducts,
  getStats,
  getStorageStatus,
  getCriteria,
  setCriteria,
  resetCriteria,
  getFilteredProducts,
  getProductById,
  updateProduct,
  addProduct,
  deleteProduct,
  resetProducts,
  exportProductsJson,
  importProductsJson,
  subscribe,
} from './store.js';
import {
  renderLayout,
  renderKatalog,
  renderDashboard,
  syncControls,
  showToast,
  showBanner,
  hideBanner,
  openDetailModal,
  closeDetailModal,
  bindModalKeyboard,
  openProductForm,
} from './ui.js';

const root = document.querySelector('#app');
const refs = renderLayout(root);

/* ------------------------------------------------------------
   M6 — feedback storage & cadangan JSON
   ------------------------------------------------------------ */

const STORAGE_WARNING = 'PENYIMPANAN LOKAL TIDAK TERSEDIA; PERUBAHAN HANYA SESI INI.';
const IMPORT_MIME_ERROR = 'GAGAL IMPORT: TIPE FILE HARUS APPLICATION/JSON.';
const IMPORT_SIZE_ERROR = 'GAGAL IMPORT: UKURAN FILE MELEBIHI BATAS.';
let storageWarned = false;

/** Banner + toast hanya sekali per sesi bila storage tidak bisa dipakai. */
function warnStorage() {
  if (getStorageStatus() || storageWarned) return;
  storageWarned = true;
  showBanner(STORAGE_WARNING, 'warning');
  showToast(STORAGE_WARNING, 'warning');
}

/** Unduh cadangan katalog memakai Blob + object URL. */
function eksporJson() {
  try {
    const blob = new Blob([exportProductsJson()], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'costestant-backup.json';
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 0);
    showToast('EXPORT BERHASIL: costestant-backup.json DIUNDUH.');
  } catch {
    showBanner('GAGAL EXPORT: BROWSER TIDAK MENDUKUNG PENGUNDUHAN FILE.', 'error');
    showToast('GAGAL EXPORT: PENGUNDUHAN TIDAK DIDUKUNG.', 'error');
  }
}

/** Baca file .json lalu validasi & commit lewat store; pesan error spesifik. */
async function imporJson(file, input) {
  if (!file) return;
  if (!/\.json$/i.test(file.name)) {
    showBanner('GAGAL IMPORT: PILIH FILE DENGAN EKSTENSI .JSON.', 'error');
    showToast('GAGAL IMPORT: EKSTENSI FILE HARUS .JSON.', 'error');
    if (input) input.value = '';
    return;
  }
  if (file.type && file.type !== 'application/json') {
    showBanner(IMPORT_MIME_ERROR, 'error');
    showToast(IMPORT_MIME_ERROR, 'error');
    if (input) input.value = '';
    return;
  }
  if (file.size > MAX_IMPORT_BYTES) {
    showBanner(IMPORT_SIZE_ERROR, 'error');
    showToast(IMPORT_SIZE_ERROR, 'error');
    if (input) input.value = '';
    return;
  }

  try {
    const hasil = importProductsJson(await file.text());
    if (!hasil.ok) {
      showBanner(hasil.error, 'error');
      showToast(hasil.error, 'error');
      return;
    }
    hideBanner();
    showToast(`IMPORT BERHASIL: ${hasil.count} KOSTUM DIMUAT.`);
  } catch {
    showBanner('GAGAL IMPORT: FILE TIDAK DAPAT DIBACA.', 'error');
    showToast('GAGAL IMPORT: FILE TIDAK DAPAT DIBACA.', 'error');
  } finally {
    if (input) input.value = '';
    const button = refs.dashboard.querySelector('[data-focus-key="toolbar:import"]');
    if (button) button.focus();
  }
}

function render() {
  const criteria = getCriteria();
  const products = getProducts();
  const filtered = getFilteredProducts();
  const stats = getStats();

  refs.stockNumber.textContent = String(stats.unitStokTersedia);
  syncControls(refs, criteria, filtered.length, products.length);
  renderKatalog(refs.gridHost, filtered);
  renderDashboard(refs.dashboard, stats, products);
}

function activateTab(name, scroll = true) {
  refs.tabs.forEach((tab) => {
    const active = tab.dataset.tab === name;
    tab.classList.toggle('is-active', active);
    if (active) tab.setAttribute('aria-current', 'page');
    else tab.removeAttribute('aria-current');
  });
  refs.panels.katalog.hidden = name !== 'katalog';
  refs.panels.dashboard.hidden = name !== 'dashboard';
  if (scroll) refs.panels[name].scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function scrollToCatalog() {
  refs.katalogPanel.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

refs.tabs.forEach((tab) => {
  tab.addEventListener('click', () => activateTab(tab.dataset.tab));
});
refs.cta.addEventListener('click', scrollToCatalog);
refs.heroButton.addEventListener('click', scrollToCatalog);

// Pencarian hero dan bar filter memakai satu state yang sama.
refs.heroSearch.addEventListener('input', (event) => {
  setCriteria({ search: event.target.value });
});
refs.controls.searchInput.addEventListener('input', (event) => {
  setCriteria({ search: event.target.value });
});
refs.controls.chipRow.addEventListener('click', (event) => {
  const chip = event.target.closest('.chip');
  if (chip) setCriteria({ kategori: chip.dataset.value });
});
refs.controls.ukuran.addEventListener('change', (event) => {
  setCriteria({ ukuran: event.target.value });
});
refs.controls.status.addEventListener('change', (event) => {
  setCriteria({ status: event.target.value });
});
refs.controls.sort.addEventListener('change', (event) => {
  setCriteria({ sortBy: event.target.value });
});
refs.controls.reset.addEventListener('click', () => resetCriteria());

/** Jalur ke-2 SPEC.md 4.4: simulasi sewa menurunkan stok / mengubah status. */
function simulasiSewa(id) {
  const product = getProducts().find((item) => item.id === id);
  if (!product || product.status !== 'Tersedia' || Number(product.stok) <= 0) return;
  const stok = Number(product.stok);
  if (stok > 1) {
    updateProduct(id, { stok: stok - 1 });
    showToast(`SIMULASI SEWA: STOK ${product.nama} MENJADI ${stok - 1}.`);
  } else {
    updateProduct(id, { stok: 0, status: 'Sedang Disewa' });
    showToast(`SIMULASI SEWA: ${product.nama} BERUBAH MENJADI DISEWA.`);
  }
  warnStorage();
  closeDetailModal();
}

root.addEventListener('click', (event) => {
  if (event.target.closest('[data-action="reset-filters"]')) {
    resetCriteria();
    return;
  }
  const button = event.target.closest('[data-action="open-detail"]');
  if (button && !button.disabled) {
    const product = getProducts().find((item) => item.id === button.dataset.id);
    if (product) openDetailModal(product, button, simulasiSewa);
  }
});

/* ------------------------------------------------------------
   Dashboard pengelola (M5) — callback untuk modal form & aksi baris
   ------------------------------------------------------------ */

function simpanFormKostum(values, id) {
  if (id) {
    updateProduct(id, values);
    showToast('KOSTUM TERSIMPAN.');
  } else {
    addProduct(values);
    showToast('KOSTUM DITAMBAHKAN.');
  }
  warnStorage();
}

function hapusProduk(id) {
  const product = getProductById(id);
  if (!product) return;
  const ok = window.confirm(
    'HAPUS KOSTUM INI? TINDAKAN INI TIDAK DAPAT DIBATALKAN.',
  );
  if (!ok) return;
  deleteProduct(id);
  showToast('KOSTUM DIHAPUS.');
  warnStorage();
}

function ubahStatusCepat(id, status) {
  const product = getProductById(id);
  if (!product || product.status === status) return;
  updateProduct(id, { status });
  showToast(`STATUS ${String(product.nama).toUpperCase()} → ${status.toUpperCase()}.`);
  warnStorage();
}

function resetDataDummy() {
  const ok = window.confirm(
    'RESET DATA DUMMY? SELURUH PERUBAHAN AKAN DIKEMBALIKAN.',
  );
  if (!ok) return;
  resetProducts();
  showToast('DATA DUMMY DIKEMBALIKAN.');
  warnStorage();
}

refs.dashboard.addEventListener('click', (event) => {
  if (event.target.closest('[data-action="export-json"]')) {
    eksporJson();
    return;
  }
  const importButton = event.target.closest('[data-action="import-json"]');
  if (importButton) {
    const input = refs.dashboard.querySelector('[data-action="import-file"]');
    if (input) input.click();
    return;
  }
  const open = event.target.closest('[data-action="open-form"]');
  if (open) {
    const product = open.dataset.id ? getProductById(open.dataset.id) : null;
    openProductForm(product, open, simpanFormKostum);
    return;
  }
  const hapus = event.target.closest('[data-action="delete-product"]');
  if (hapus) {
    hapusProduk(hapus.dataset.id);
    return;
  }
  if (event.target.closest('[data-action="reset-data"]')) resetDataDummy();
});

refs.dashboard.addEventListener('change', (event) => {
  const fileInput = event.target.closest('[data-action="import-file"]');
  if (fileInput) {
    imporJson(fileInput.files?.[0], fileInput);
    return;
  }
  const select = event.target.closest('[data-action="quick-status"]');
  if (!select) return;
  const focusKey = select.dataset.focusKey;
  ubahStatusCepat(select.dataset.id, select.value);
  // renderDashboard mengganti DOM, jadi kembalikan fokus ke select yang sama.
  if (focusKey && typeof CSS !== 'undefined' && typeof CSS.escape === 'function') {
    const again = refs.dashboard.querySelector(`[data-focus-key="${CSS.escape(focusKey)}"]`);
    if (again) again.focus();
  }
});

bindModalKeyboard();
const init = initStore();
render();
subscribe(render);
activateTab('katalog', false);

if (init.issue) {
  showBanner(init.issue.message, init.issue.kind === 'corrupt' ? 'error' : 'warning');
}
warnStorage();
