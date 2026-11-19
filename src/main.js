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
  subscribe,
} from './store.js';
import { renderLayout, renderKatalog, renderDashboard, showToast } from './ui.js';

const root = document.querySelector('#app');
const refs = renderLayout(root);

function render() {
  const products = getProducts();
  const stats = getStats();
  refs.stockNumber.textContent = String(stats.unitStokTersedia);
  renderKatalog(refs.katalog, products);
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

refs.tabs.forEach((tab) => {
  tab.addEventListener('click', () => activateTab(tab.dataset.tab));
});

refs.cta.addEventListener('click', () => {
  refs.katalogPanel.scrollIntoView({ behavior: 'smooth', block: 'start' });
});

initStore();
render();
subscribe(render);
activateTab('katalog');

if (!getStorageStatus()) {
  showToast('PENYIMPANAN LOKAL TIDAK TERSEDIA; PERUBAHAN HANYA SESI INI.', 'warning');
}
