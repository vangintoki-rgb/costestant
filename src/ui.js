/**
 * ui.js — Render komponen DOM + sanitasi teks anti-XSS.
 * Semua nilai dinamis ditulis lewat textContent / DOM API, bukan innerHTML
 * (SPEC.md 4.2.8 / R3).
 */
import {
  DURASI_MAX,
  DURASI_MIN,
  KATEGORI,
  STATUS,
  UKURAN,
  WHATSAPP_NUMBER,
  buildWhatsAppUrl,
  clampDurasi,
  formatRupiah,
  getRentalBreakdown,
} from './products.js';

export { formatRupiah };

/** Fallback lokal bila aset SVG kostum gagal dimuat (SPEC NFR5). */
const FALLBACK_IMAGE = '/images/placeholder.svg';

const STATUS_LABEL = Object.freeze({
  Tersedia: 'TERSEDIA',
  'Sedang Disewa': 'DISEWA',
  Perawatan: 'PERAWATAN',
});

const STATUS_CLASS = Object.freeze({
  Tersedia: 'badge--tersedia',
  'Sedang Disewa': 'badge--disewa',
  Perawatan: 'badge--perawatan',
});

/** Escape teks bebas bila suatu saat dipakai dalam string HTML. */
export function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function createEl(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined && text !== null) node.textContent = String(text);
  return node;
}

function append(parent, ...children) {
  children.forEach((child) => {
    if (child) parent.appendChild(child);
  });
  return parent;
}

function svgEl(tag, attrs = {}) {
  const node = document.createElementNS('http://www.w3.org/2000/svg', tag);
  Object.entries(attrs).forEach(([key, value]) => node.setAttribute(key, String(value)));
  return node;
}

function starIcon() {
  const svg = svgEl('svg', {
    width: 16,
    height: 16,
    viewBox: '0 0 24 24',
    fill: 'currentColor',
    stroke: '#111111',
    'stroke-width': 1,
  });
  svg.appendChild(
    svgEl('path', { d: 'M12 2l3.1 6.3 6.9 1-5 4.9 1.2 6.8L12 17.8 5.8 21l1.2-6.8-5-4.9 6.9-1L12 2z' }),
  );
  return svg;
}

function warningIcon() {
  const svg = svgEl('svg', {
    width: 12,
    height: 12,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    'stroke-width': 2.5,
  });
  svg.appendChild(svgEl('path', { d: 'M12 3L2 21h20L12 3zm0 6v5zm0 3h.01' }));
  return svg;
}

/** Ikon TV static untuk empty state (garis horizontal). */
function staticIcon() {
  const svg = svgEl('svg', {
    width: 64,
    height: 48,
    viewBox: '0 0 64 48',
    fill: 'none',
    stroke: 'currentColor',
    'stroke-width': 2,
  });
  for (let y = 5; y < 48; y += 6) {
    svg.appendChild(svgEl('line', { x1: 3, y1: y, x2: 61, y2: y }));
  }
  return svg;
}

/** Satu komponen StatusBadge yang dipakai ulang di kartu, modal, dashboard. */
export function createStatusBadge(status) {
  const safeStatus = STATUS.includes(status) ? status : 'Perawatan';
  const badge = createEl('span', `badge ${STATUS_CLASS[safeStatus]}`);
  if (safeStatus === 'Perawatan') badge.appendChild(warningIcon());
  badge.appendChild(createEl('span', 'un-skew', STATUS_LABEL[safeStatus]));
  return badge;
}

function createKostumCard(product) {
  const card = createEl('article', 'kostum-card');
  const tersedia = product.status === 'Tersedia' && Number(product.stok) > 0;

  const media = createEl('div', 'kostum-media');
  const image = createEl('img');
  image.src = product.imageUrl || FALLBACK_IMAGE;
  image.alt = `Ilustrasi kostum ${product.nama} dari ${product.asal}`;
  image.loading = 'lazy';
  image.onerror = () => {
    if (image.dataset.fallback !== '1') {
      image.dataset.fallback = '1';
      image.src = FALLBACK_IMAGE;
    }
  };
  media.appendChild(image);

  const asal = createEl('span', 'badge badge--kuning kostum-asal');
  asal.appendChild(createEl('span', 'un-skew', product.asal));
  media.appendChild(asal);

  if (product.unggulan) {
    const star = createEl('span', 'kostum-star');
    star.appendChild(starIcon());
    media.appendChild(star);
  }
  media.appendChild(createEl('span', 'kostum-ukuran', product.ukuran));

  if (!tersedia) {
    const stamp =
      product.status === 'Sedang Disewa'
        ? ['DISEWA', 'kostum-stamp--disewa']
        : product.status === 'Perawatan'
          ? ['PERAWATAN', 'kostum-stamp--perawatan']
          : ['STOK HABIS', 'kostum-stamp--habis'];
    media.appendChild(createEl('span', `kostum-stamp ${stamp[1]}`, stamp[0]));
  }
  card.appendChild(media);

  card.appendChild(
    createEl('div', 'ribbon-harga', `${formatRupiah(product.hargaPer2Hari)} / 2 HARI`),
  );

  const body = createEl('div', 'kostum-body');
  body.appendChild(createEl('h3', null, product.nama));
  body.appendChild(createEl('p', 'kostum-meta', `${product.kategori} · ${product.ukuran}`));

  const foot = createEl('div', 'kostum-foot');
  const stok = createEl('span', `kostum-stok${tersedia ? '' : ' kostum-stok--kosong'}`);
  stok.appendChild(createEl('span', 'stok-dot'));
  stok.appendChild(createEl('span', null, `STOK: ${product.stok}`));
  foot.appendChild(stok);
  foot.appendChild(createStatusBadge(product.status));
  body.appendChild(foot);

  // Handler modal dipasang di Milestone 4.
  const detail = createEl('button', 'btn btn-primary card-action', 'DETAIL & SEWA');
  detail.type = 'button';
  detail.dataset.action = 'open-detail';
  detail.dataset.id = product.id;

  let reason = null;
  if (!tersedia) {
    reason = createEl('p', 'card-reason', 'KOSTUM TIDAK TERSEDIA UNTUK DISEWA.');
    reason.id = `alasan-${product.id}`;
    detail.disabled = true;
    detail.setAttribute('aria-describedby', reason.id);
  }
  body.appendChild(detail);
  if (reason) body.appendChild(reason);

  card.appendChild(body);
  return card;
}

function createTokenPanel() {
  const tokens = createEl('section', 'token-panel');
  tokens.appendChild(createEl('h3', 'label', 'PRATINJAU TOKEN DESAIN'));
  const swatches = createEl('div', 'token-grid');
  const tokenList = [
    ['PERSONA YELLOW', 'swatch--yellow', '#FFE600'],
    ['HITAM PEKAT', 'swatch--ink', '#111111'],
    ['PUTIH', 'swatch--paper', '#FFFFFF'],
    ['MERAH AKESEN', 'swatch--alert', '#E60012'],
    ['HIJAU WHATSAPP', 'swatch--emerald', '#10B981'],
  ];
  tokenList.forEach(([label, className, hex]) => {
    const swatch = createEl('div', `swatch ${className}`);
    swatch.appendChild(createEl('span', 'swatch-name label', label));
    swatch.appendChild(createEl('span', 'swatch-hex', hex));
    swatches.appendChild(swatch);
  });
  tokens.appendChild(swatches);

  const badgeRow = createEl('div', 'token-badges');
  badgeRow.appendChild(createStatusBadge('Tersedia'));
  badgeRow.appendChild(createStatusBadge('Sedang Disewa'));
  badgeRow.appendChild(createStatusBadge('Perawatan'));
  badgeRow.appendChild(createEl('span', 'badge badge--kuning hard-shadow label', 'HARD BORDER + SHADOW'));
  tokens.appendChild(badgeRow);
  return tokens;
}

function createSelect(labelText, options) {
  const wrap = createEl('label', 'field');
  wrap.appendChild(createEl('span', 'label', labelText));
  const select = createEl('select', 'filter-select');
  options.forEach((option) => {
    const value = Array.isArray(option) ? option[0] : option;
    const text = Array.isArray(option)
      ? option[1]
      : value === 'Semua'
        ? 'SEMUA'
        : String(value).toUpperCase();
    const item = createEl('option', null, text);
    item.value = value;
    select.appendChild(item);
  });
  wrap.appendChild(select);
  return { wrap, select };
}

/** Bar kontrol: pencarian, chip kategori, select ukuran/status/sort, reset. */
function createFilterBar() {
  const bar = createEl('section', 'filter-bar');

  const row1 = createEl('div', 'filter-row');
  const searchField = createEl('label', 'field field--search');
  searchField.appendChild(createEl('span', 'label', 'CARI KOSTUM / SERIES'));
  const searchInput = createEl('input');
  searchInput.type = 'search';
  searchInput.placeholder = 'CARI KARAKTER ATAU SERIES...';
  searchInput.setAttribute('aria-label', 'Cari nama kostum atau asal series');
  searchField.appendChild(searchInput);

  const chipField = createEl('div', 'field field--chips');
  chipField.appendChild(createEl('span', 'label', 'KATEGORI'));
  const chipRow = createEl('div', 'chip-row');
  ['Semua', ...KATEGORI].forEach((value) => {
    const chip = createEl('button', 'chip', value === 'Semua' ? 'SEMUA' : value.toUpperCase());
    chip.type = 'button';
    chip.dataset.value = value;
    chipRow.appendChild(chip);
  });
  chipField.appendChild(chipRow);
  append(row1, searchField, chipField);
  bar.appendChild(row1);

  const row2 = createEl('div', 'filter-row filter-row--bottom');
  const ukuran = createSelect('UKURAN', ['Semua', ...UKURAN]);
  const status = createSelect('STATUS', ['Semua', ...STATUS]);
  const sort = createSelect('URUTKAN', [
    ['unggulan', 'KOSTUM UNGULAN'],
    ['harga-asc', 'HARGA TERENDAH'],
    ['harga-desc', 'HARGA TERTINGGI'],
    ['nama-asc', 'NAMA A–Z'],
  ]);
  const counter = createEl('span', 'filter-count label', '');
  counter.setAttribute('role', 'status');
  const reset = createEl('button', 'btn-reset-filter label', 'HAPUS FILTER');
  reset.type = 'button';
  reset.hidden = true;
  append(row2, ukuran.wrap, status.wrap, sort.wrap, counter, reset);
  bar.appendChild(row2);

  return {
    bar,
    searchInput,
    chipRow,
    ukuran: ukuran.select,
    status: status.select,
    sort: sort.select,
    counter,
    reset,
  };
}

/** Bangun kerangka halaman: navbar, hero, dua panel tab, footer. */
export function renderLayout(root) {
  root.replaceChildren();

  // ---- Navbar ----
  const navbar = createEl('header', 'navbar');
  const navInner = createEl('div', 'container navbar-inner');

  const logo = createEl('div', 'logo skew');
  logo.appendChild(createEl('span', 'un-skew', 'COSTESTANT'));
  navInner.appendChild(logo);

  const tabs = createEl('nav', 'nav-tabs');
  tabs.setAttribute('aria-label', 'Navigasi utama');
  const tabKatalog = createEl('button', 'nav-tab is-active', 'KATALOG KOSTUM');
  tabKatalog.type = 'button';
  tabKatalog.dataset.tab = 'katalog';
  tabKatalog.setAttribute('aria-current', 'page');
  const tabDashboard = createEl('button', 'nav-tab', 'DASHBOARD PENGELOLA');
  tabDashboard.type = 'button';
  tabDashboard.dataset.tab = 'dashboard';
  append(tabs, tabKatalog, tabDashboard);
  navInner.appendChild(tabs);

  const chip = createEl('div', 'stock-chip');
  chip.appendChild(createEl('span', 'stock-dot'));
  const chipText = createEl('span', null, 'STOK: ');
  const stockNumber = createEl('strong', null, '0');
  chipText.appendChild(stockNumber);
  chip.appendChild(chipText);
  navInner.appendChild(chip);
  navbar.appendChild(navInner);
  root.appendChild(navbar);

  // ---- Hero ----
  const hero = createEl('section', 'hero scanlines');
  const heroInner = createEl('div', 'container hero-inner');
  heroInner.appendChild(createEl('span', 'channel-stamp label', 'CHANNEL 04 // RENTAL'));
  heroInner.appendChild(createEl('h1', 'display hero-title', 'SEWA KOSTUM COSPLAY'));
  heroInner.appendChild(
    createEl('p', 'hero-sub', 'TEMUKAN KARAKTERMU. PILIH TANGGAL, HITUNG BIAYA, CHAT TOKO.'),
  );

  const heroSearch = createEl('input');
  heroSearch.type = 'search';
  heroSearch.placeholder = 'CARI KARAKTER ATAU SERIES...';
  heroSearch.setAttribute('aria-label', 'Cari kostum atau series dari hero');
  const heroButton = createEl('button', 'btn btn-dark', 'CARI');
  heroButton.type = 'button';
  const search = createEl('div', 'hero-search');
  append(search, heroSearch, heroButton);
  heroInner.appendChild(search);
  heroInner.appendChild(
    createEl('p', 'hero-hint', 'CARI BERDASARKAN NAMA KOSTUM ATAU ASAL SERIES.'),
  );

  const actions = createEl('div', 'hero-actions');
  const cta = createEl('button', 'btn btn-dark', 'LIHAT KATALOG');
  cta.type = 'button';
  actions.appendChild(cta);
  heroInner.appendChild(actions);
  hero.appendChild(heroInner);
  root.appendChild(hero);

  // ---- Dua panel tab ----
  const main = createEl('main', 'container page-main');
  const katalogPanel = createEl('section', 'tab-panel');
  katalogPanel.id = 'panel-katalog';
  katalogPanel.setAttribute('role', 'tabpanel');
  const dashboardPanel = createEl('section', 'tab-panel');
  dashboardPanel.id = 'panel-dashboard';
  dashboardPanel.setAttribute('role', 'tabpanel');
  dashboardPanel.hidden = true;
  append(main, katalogPanel, dashboardPanel);
  root.appendChild(main);

  const katalog = createEl('div');
  const head = createEl('div', 'section-heading');
  const headLeft = createEl('div');
  headLeft.appendChild(createEl('h2', 'display section-title', 'KATALOG KOSTUM'));
  headLeft.appendChild(
    createEl('p', 'section-sub', 'Katalog sewa kostum cosplay — data dummy fiktif nonpribadi.'),
  );
  const resultCount = createEl('span', 'label result-count', '8 HASIL');
  append(head, headLeft, resultCount);

  const controls = createFilterBar();
  const gridHost = createEl('div', 'grid-host');
  append(katalog, head, createTokenPanel(), controls.bar, gridHost);
  katalogPanel.appendChild(katalog);

  const dashboard = createEl('div');
  dashboardPanel.appendChild(dashboard);

  // ---- Footer ----
  const footer = createEl('footer', 'site-footer');
  const footerInner = createEl('div', 'container');
  footerInner.appendChild(
    createEl(
      'p',
      null,
      'COSTESTANT · PROTOTYPE 1 HARI · DATA DUMMY NONPRIBADI · WHATSAPP: 6281234567890 (DEMO)',
    ),
  );
  footer.appendChild(footerInner);
  root.appendChild(footer);

  // Modal detail dibuat sekali di awal agar bisa dibuka dari kartu mana pun.
  createDetailModal();

  return {
    tabs: [tabKatalog, tabDashboard],
    panels: { katalog: katalogPanel, dashboard: dashboardPanel },
    katalogPanel,
    gridHost,
    controls,
    resultCount,
    dashboard,
    stockNumber,
    heroSearch,
    heroButton,
    cta,
  };
}

/** Samakan seluruh kontrol dengan state (satu source of truth). */
export function syncControls(refs, criteria, visibleCount, total) {
  const setValue = (input, value) => {
    if (input && input.value !== value) input.value = value;
  };
  setValue(refs.heroSearch, criteria.search);
  setValue(refs.controls.searchInput, criteria.search);
  setValue(refs.controls.ukuran, criteria.ukuran);
  setValue(refs.controls.status, criteria.status);
  setValue(refs.controls.sort, criteria.sortBy);

  refs.controls.chipRow.querySelectorAll('.chip').forEach((chip) => {
    const active = chip.dataset.value === criteria.kategori;
    chip.classList.toggle('is-active', active);
    chip.setAttribute('aria-pressed', active ? 'true' : 'false');
  });

  const adaFilter =
    String(criteria.search).trim() !== '' ||
    criteria.kategori !== 'Semua' ||
    criteria.ukuran !== 'Semua' ||
    criteria.status !== 'Semua' ||
    criteria.sortBy !== 'unggulan';
  refs.controls.reset.hidden = !adaFilter;

  refs.controls.counter.textContent = `Menampilkan ${visibleCount} dari ${total} kostum`;
  refs.resultCount.textContent = `${visibleCount} HASIL`;
}

/** Render grid hasil atau empty state. */
export function renderKatalog(gridHost, products) {
  gridHost.replaceChildren();

  if (products.length === 0) {
    const empty = createEl('div', 'empty-state');
    const icon = createEl('div', 'empty-icon');
    icon.appendChild(staticIcon());
    empty.appendChild(icon);
    empty.appendChild(createEl('p', 'display empty-title', 'TIDAK ADA KOSTUM YANG COCOK.'));
    empty.appendChild(createEl('p', 'empty-sub', 'Coba kata kunci atau filter lain.'));
    const reset = createEl('button', 'btn btn-danger empty-reset', 'RESET SEMUA FILTER');
    reset.type = 'button';
    reset.dataset.action = 'reset-filters';
    empty.appendChild(reset);
    gridHost.appendChild(empty);
    return;
  }

  const grid = createEl('div', 'grid-kostum');
  products.forEach((product) => grid.appendChild(createKostumCard(product)));
  gridHost.appendChild(grid);
}

/** Render 3 kartu statistik sesuai rumus SPEC.md 4.3. */
export function renderDashboard(container, stats) {
  container.replaceChildren();

  const head = createEl('div', 'section-heading');
  const headLeft = createEl('div');
  headLeft.appendChild(createEl('h2', 'display section-title', 'DASHBOARD PENGELOLA'));
  headLeft.appendChild(createEl('p', 'section-sub', 'KELOLA KATALOG & STOK TOKO'));
  head.appendChild(headLeft);
  container.appendChild(head);

  const grid = createEl('div', 'stat-grid');
  const cards = [
    ['TOTAL KATALOG', stats.totalKatalog, 'stat-strip--yellow', `${stats.totalKatalog} data dummy`],
    ['UNIT STOK TERSEDIA', stats.unitStokTersedia, 'stat-strip--emerald', 'status TERSEDIA saja'],
    ['SEDANG DISEWA', stats.kostumDisewa, 'stat-strip--alert', 'status DISEWA'],
  ];
  cards.forEach(([label, value, strip, note]) => {
    const card = createEl('article', 'stat-card');
    card.appendChild(createEl('div', `stat-strip ${strip}`));
    const body = createEl('div', 'stat-body');
    body.appendChild(createEl('p', 'label stat-label', label));
    body.appendChild(createEl('p', 'display stat-number', String(value)));
    body.appendChild(createEl('span', 'label stat-note', note));
    card.appendChild(body);
    grid.appendChild(card);
  });
  container.appendChild(grid);

  const notice = createEl('div', 'notice');
  notice.appendChild(createEl('p', 'label', 'AKSI PENGELOLA'));
  notice.appendChild(
    createEl(
      'p',
      null,
      'Tabel CRUD, form tambah/edit, ubah status cepat, hapus, dan reset hadir di Milestone 5.',
    ),
  );
  container.appendChild(notice);
}

/** Toast sederhana (dipakai milestone berikutnya untuk feedback storage/CRUD). */
export function showToast(message, variant = 'success') {
  const previous = document.querySelector('.toast');
  if (previous) previous.remove();
  const toast = createEl('div', `toast toast--${variant}`, message);
  toast.setAttribute('role', 'status');
  document.body.appendChild(toast);
  window.setTimeout(() => toast.remove(), 3000);
}

/* ------------------------------------------------------------
   Modal detail + kalkulator sewa + tautan WhatsApp (M4)
   ------------------------------------------------------------ */

let detailModal = null;
let modalTrigger = null;
let modalOnSimulate = null;

/** Tanggal lokal (bukan UTC) untuk nilai <input type="date">. */
function toDateInputValue(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function todayValue() {
  return toDateInputValue(new Date());
}

function whatsappIcon() {
  const svg = svgEl('svg', {
    width: 20,
    height: 20,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    'stroke-width': 2.5,
    'stroke-linecap': 'round',
    'stroke-linejoin': 'round',
  });
  svg.appendChild(
    svgEl('path', { d: 'M21 11.5a8.5 8.5 0 0 1-12.6 7.4L3 20l1.2-5.4A8.5 8.5 0 1 1 21 11.5z' }),
  );
  svg.appendChild(svgEl('path', { d: 'M9 9.5c0 3 2.5 5.5 5.5 5.5l1.2-1.8-2-1-1 1a7 7 0 0 1-2-2l1-1-1-2z' }));
  return svg;
}

function appendMeta(list, label, value) {
  list.appendChild(createEl('dt', 'label', label));
  list.appendChild(createEl('dd', null, value));
}

/** Bangun sekali saat renderLayout; seluruh teks kostum ditulis saat dibuka. */
function createDetailModal() {
  const overlay = createEl('div', 'modal-overlay');
  overlay.hidden = true;

  const panel = createEl('div', 'modal-panel');
  panel.setAttribute('role', 'dialog');
  panel.setAttribute('aria-modal', 'true');
  panel.setAttribute('aria-labelledby', 'modal-title');

  const header = createEl('header', 'modal-header');
  const title = createEl('h2', 'display modal-title', '');
  title.id = 'modal-title';
  const close = createEl('button', 'modal-close', '✕');
  close.type = 'button';
  close.setAttribute('aria-label', 'Tutup detail kostum');
  append(header, title, close);

  const body = createEl('div', 'modal-body');

  const media = createEl('div', 'modal-media');
  const image = createEl('img');
  image.alt = '';
  image.loading = 'lazy';
  image.onerror = () => {
    if (image.dataset.fallback !== '1') {
      image.dataset.fallback = '1';
      image.src = FALLBACK_IMAGE;
    }
  };
  const mediaBadges = createEl('div', 'modal-media-badges');
  media.append(image, mediaBadges);

  const info = createEl('div', 'modal-info');
  const meta = createEl('dl', 'modal-meta');

  const desc = createEl('section', 'modal-desc');
  desc.appendChild(createEl('h3', 'label', 'KELENGKAPAN KOSTUM'));
  const descText = createEl('p', 'modal-desc-text', '');
  desc.appendChild(descText);

  const calc = createEl('section', 'calc-panel');
  calc.appendChild(createEl('h3', 'label calc-title', 'HITUNG ESTIMASI SEWA'));

  const tanggalField = createEl('div', 'calc-field');
  const tanggalLabel = createEl('label', 'label', 'TANGGAL MULAI');
  const tanggalInput = createEl('input', 'calc-date');
  tanggalInput.type = 'date';
  tanggalInput.id = 'modal-tanggal-mulai';
  tanggalLabel.htmlFor = tanggalInput.id;
  tanggalInput.min = todayValue();
  tanggalInput.value = todayValue();
  append(tanggalField, tanggalLabel, tanggalInput);

  const durasiField = createEl('div', 'calc-field');
  durasiField.appendChild(createEl('span', 'label', 'DURASI'));
  const stepper = createEl('div', 'stepper');
  const minus = createEl('button', 'stepper-btn', '−');
  minus.type = 'button';
  minus.dataset.step = '-1';
  minus.setAttribute('aria-label', 'Kurangi durasi');
  const durationInput = createEl('input', 'stepper-input');
  durationInput.type = 'number';
  durationInput.min = String(DURASI_MIN);
  durationInput.max = String(DURASI_MAX);
  durationInput.step = '1';
  durationInput.value = String(DURASI_MIN);
  durationInput.setAttribute('aria-label', 'Durasi sewa dalam hari');
  const plus = createEl('button', 'stepper-btn', '+');
  plus.type = 'button';
  plus.dataset.step = '1';
  plus.setAttribute('aria-label', 'Tambah durasi');
  append(stepper, minus, durationInput, plus);
  append(durasiField, stepper, createEl('span', 'label', 'HARI'));

  const presets = createEl('div', 'duration-presets');
  presets.setAttribute('role', 'group');
  presets.setAttribute('aria-label', 'Pintasan durasi kelipatan 2 hari');
  presets.appendChild(createEl('span', 'label', 'CEPAT:'));
  [2, 4, 6, 8, 10].forEach((days) => {
    const preset = createEl('button', 'duration-preset label', `${days} HARI`);
    preset.type = 'button';
    preset.dataset.days = String(days);
    presets.appendChild(preset);
  });

  const breakdown = createEl('div', 'calc-breakdown');
  const paketRow = createEl('div', 'calc-row');
  const paketLabel = createEl('span', null, 'PAKET 2 HARI ×1');
  const paketAmount = createEl('span', 'calc-amount', 'Rp 0');
  append(paketRow, paketLabel, paketAmount);
  const tambahRow = createEl('div', 'calc-row');
  const tambahLabel = createEl('span', null, 'TAMBAHAN 0 HARI × Rp 0');
  const tambahAmount = createEl('span', 'calc-amount', 'Rp 0');
  append(tambahRow, tambahLabel, tambahAmount);
  append(breakdown, paketRow, tambahRow);

  const totalStrip = createEl('div', 'calc-total');
  totalStrip.appendChild(createEl('span', 'label', 'TOTAL ESTIMASI'));
  const totalValue = createEl('strong', 'calc-total-value', 'Rp 0');
  totalStrip.appendChild(totalValue);

  append(calc, tanggalField, durasiField, presets, breakdown, totalStrip);

  const simulateLabel = createEl('label', 'simulate-row');
  const simulateCheck = createEl('input', 'simulate-check');
  simulateCheck.type = 'checkbox';
  simulateLabel.append(
    simulateCheck,
    createEl('span', 'label', 'TANDAI SEBAGAI DISEWA (SIMULASI)'),
  );

  const waSlot = createEl('div', 'wa-slot');

  append(info, meta, desc, calc, simulateLabel, waSlot);
  append(body, media, info);
  append(panel, header, body);
  overlay.appendChild(panel);
  document.body.appendChild(overlay);

  const refs = {
    overlay,
    panel,
    close,
    title,
    image,
    mediaBadges,
    meta,
    descText,
    tanggalInput,
    durationInput,
    presets,
    paketAmount,
    tambahLabel,
    tambahAmount,
    totalValue,
    simulateCheck,
    waSlot,
  };

  close.addEventListener('click', closeDetailModal);
  overlay.addEventListener('click', (event) => {
    if (event.target === overlay) closeDetailModal();
  });
  minus.addEventListener('click', () => {
    durationInput.value = String(clampDurasi(Number(durationInput.value) - 1));
    updateModalCalculator();
  });
  plus.addEventListener('click', () => {
    durationInput.value = String(clampDurasi(Number(durationInput.value) + 1));
    updateModalCalculator();
  });
  durationInput.addEventListener('input', updateModalCalculator);
  durationInput.addEventListener('change', updateModalCalculator);
  presets.addEventListener('click', (event) => {
    const preset = event.target.closest('.duration-preset');
    if (preset) {
      durationInput.value = preset.dataset.days;
      updateModalCalculator();
    }
  });
  tanggalInput.addEventListener('change', () => {
    if (tanggalInput.value && tanggalInput.value < tanggalInput.min) {
      tanggalInput.value = tanggalInput.min;
      showToast('TANGGAL LAMPAU TIDAK DIIZINKAN.', 'warning');
    }
    updateModalCalculator();
  });
  waSlot.addEventListener('click', (event) => {
    const link = event.target.closest('.btn-whatsapp');
    if (!link) return;
    if (refs.simulateCheck.checked && typeof modalOnSimulate === 'function') {
      modalOnSimulate(detailModal.product.id);
    }
  });

  detailModal = refs;
  return refs;
}

/** Hitung ulang rincian + perbarui tautan WA setiap input berubah. */
function updateModalCalculator() {
  if (!detailModal || !detailModal.product) return;
  const { durationInput, tanggalInput, simulateCheck } = detailModal;
  const product = detailModal.product;

  const clamped = clampDurasi(durationInput.value);
  if (String(clamped) !== durationInput.value) durationInput.value = String(clamped);

  const r = getRentalBreakdown(product.hargaPer2Hari, clamped);
  detailModal.paketAmount.textContent = formatRupiah(r.hargaPer2Hari);
  detailModal.tambahLabel.textContent = `TAMBAHAN ${r.hariTambahan} HARI × ${formatRupiah(r.hargaHariTambahan)}`;
  detailModal.tambahAmount.textContent = formatRupiah(r.hariTambahan * r.hargaHariTambahan);
  detailModal.totalValue.textContent = r.totalFormatted;

  detailModal.presets.querySelectorAll('.duration-preset').forEach((preset) => {
    preset.classList.toggle('is-active', Number(preset.dataset.days) === r.durasi);
  });

  const tersedia = product.status === 'Tersedia' && Number(product.stok) > 0;
  simulateCheck.disabled = !tersedia;
  detailModal.waSlot.replaceChildren();

  if (!tersedia) {
    const reason = createEl(
      'p',
      'wa-reason',
      'KOSTUM TIDAK TERSEDIA UNTUK DISEWA.',
    );
    reason.setAttribute('role', 'alert');
    const disabled = createEl('button', 'btn btn-whatsapp is-disabled');
    disabled.type = 'button';
    disabled.disabled = true;
    disabled.appendChild(warningIcon());
    disabled.appendChild(createEl('span', null, 'SEWA VIA WHATSAPP'));
    append(detailModal.waSlot, reason, disabled);
    return;
  }

  const url = buildWhatsAppUrl(WHATSAPP_NUMBER, {
    nama: product.nama,
    asal: product.asal,
    ukuran: product.ukuran,
    tanggalMulai: tanggalInput.value || tanggalInput.min,
    durasiHari: r.durasi,
    hargaPer2Hari: product.hargaPer2Hari,
  });
  const link = createEl('a', 'btn btn-whatsapp');
  link.href = url;
  link.target = '_blank';
  link.rel = 'noopener noreferrer';
  link.appendChild(whatsappIcon());
  link.appendChild(createEl('span', null, 'SEWA VIA WHATSAPP'));
  detailModal.waSlot.appendChild(link);
}

/** Buka modal untuk satu produk; `trigger` dipakai untuk focus return. */
export function openDetailModal(product, trigger, onSimulate) {
  if (!detailModal) detailModal = createDetailModal();
  modalTrigger = trigger ?? null;
  modalOnSimulate = typeof onSimulate === 'function' ? onSimulate : null;
  detailModal.product = product;

  detailModal.title.textContent = String(product.nama ?? '').toUpperCase();
  delete detailModal.image.dataset.fallback;
  detailModal.image.src = product.imageUrl || FALLBACK_IMAGE;
  detailModal.image.alt = `Ilustrasi kostum ${product.nama} dari ${product.asal}`;

  detailModal.mediaBadges.replaceChildren();
  const asal = createEl('span', 'badge badge--kuning kostum-asal');
  asal.appendChild(createEl('span', 'un-skew', product.asal));
  detailModal.mediaBadges.appendChild(asal);
  detailModal.mediaBadges.appendChild(createStatusBadge(product.status));

  detailModal.meta.replaceChildren();
  appendMeta(detailModal.meta, 'ASAL', product.asal);
  appendMeta(detailModal.meta, 'KATEGORI', product.kategori);
  appendMeta(detailModal.meta, 'UKURAN', product.ukuran);
  appendMeta(detailModal.meta, 'HARGA PAKET', `${formatRupiah(product.hargaPer2Hari)} / 2 HARI`);
  appendMeta(detailModal.meta, 'STOK', String(product.stok));
  appendMeta(detailModal.meta, 'STATUS', String(product.status).toUpperCase());
  appendMeta(detailModal.meta, 'UNGULAN', product.unggulan ? 'YA' : 'TIDAK');

  detailModal.descText.textContent = product.deskripsi ?? '';
  detailModal.tanggalInput.min = todayValue();
  detailModal.tanggalInput.value = todayValue();
  detailModal.durationInput.value = String(DURASI_MIN);
  detailModal.simulateCheck.checked = false;
  detailModal.simulateCheck.disabled = false;
  updateModalCalculator();

  detailModal.overlay.hidden = false;
  document.body.classList.add('modal-open');
  detailModal.close.focus();
}

/** Tutup modal; kembalikan fokus ke tombol kartu pemicu. */
export function closeDetailModal() {
  if (!detailModal || detailModal.overlay.hidden) return;
  detailModal.overlay.hidden = true;
  document.body.classList.remove('modal-open');
  if (modalTrigger && modalTrigger.isConnected) modalTrigger.focus();
  modalTrigger = null;
  modalOnSimulate = null;
  if (detailModal) detailModal.product = null;
}

/** Pasang handler Esc sekali (dipanggil dari main.js). */
export function bindModalKeyboard() {
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && detailModal && !detailModal.overlay.hidden) {
      event.preventDefault();
      closeDetailModal();
    }
  });
}
