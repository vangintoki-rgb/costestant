/**
 * main.js — Entry point aplikasi Costestant.
 * Menghubungkan style.css, store.js, dan ui.js serta routing 2 tab sederhana.
 */
import './style.css';
import {
  initStore,
  getProducts,
  getStats,
  getStorageStatus,
  getCriteria,
  setCriteria,
  resetCriteria,
  getFilteredProducts,
  updateProduct,
  subscribe,
} from './store.js';
import {
  renderLayout,
  renderKatalog,
  renderDashboard,
  syncControls,
  showToast,
  openDetailModal,
  closeDetailModal,
  bindModalKeyboard,
} from './ui.js';

const root = document.querySelector('#app');
const refs = renderLayout(root);

function render() {
  const criteria = getCriteria();
  const products = getProducts();
  const filtered = getFilteredProducts();
  const stats = getStats();

  refs.stockNumber.textContent = String(stats.unitStokTersedia);
  syncControls(refs, criteria, filtered.length, products.length);
  renderKatalog(refs.gridHost, filtered);
  renderDashboard(refs.dashboard, stats);
}

function activateTab(name) {
  refs.tabs.forEach((tab) => {
    const active = tab.dataset.tab === name;
    tab.classList.toggle('is-active', active);
    if (active) tab.setAttribute('aria-current', 'page');
    else tab.removeAttribute('aria-current');
  });
  refs.panels.katalog.hidden = name !== 'katalog';
  refs.panels.dashboard.hidden = name !== 'dashboard';
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

bindModalKeyboard();
initStore();
render();
subscribe(render);
activateTab('katalog');

if (!getStorageStatus()) {
  showToast('PENYIMPANAN LOKAL TIDAK TERSEDIA; PERUBAHAN HANYA SESI INI.', 'warning');
}
