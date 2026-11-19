/**
 * ui.js — Render komponen DOM + sanitasi teks anti-XSS.
 * Semua nilai dinamis ditulis lewat textContent / DOM API, bukan innerHTML
 * (SPEC.md 4.2.8 / R3).
 */
import {
  DURASI_MAX,
  DURASI_MIN,
  KATEGORI,
  PLACEHOLDER_IMAGE,
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

const STATUS_SLUG = Object.freeze({
  Tersedia: 'tersedia',
  'Sedang Disewa': 'disewa',
  Perawatan: 'perawatan',
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

/** Ikon peringatan besar untuk banner (stroke mengikuti warna teks). */
function bannerIcon() {
  const svg = svgEl('svg', {
    width: 18,
    height: 18,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    'stroke-width': 2.5,
  });
  svg.appendChild(svgEl('path', { d: 'M12 3L2 21h20L12 3zm0 6v5zm0 3h.01' }));
  return svg;
}

function editIcon() {
  const svg = svgEl('svg', {
    width: 14,
    height: 14,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    'stroke-width': 2.5,
    'stroke-linecap': 'round',
    'stroke-linejoin': 'round',
  });
  svg.appendChild(svgEl('path', { d: 'M12 20h9' }));
  svg.appendChild(svgEl('path', { d: 'M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z' }));
  return svg;
}

function trashIcon() {
  const svg = svgEl('svg', {
    width: 14,
    height: 14,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    'stroke-width': 2.5,
    'stroke-linecap': 'round',
    'stroke-linejoin': 'round',
  });
  svg.appendChild(svgEl('path', { d: 'M3 6h18' }));
  svg.appendChild(svgEl('path', { d: 'M8 6V4h8v2' }));
  svg.appendChild(svgEl('path', { d: 'M19 6l-1 14H6L5 6' }));
  svg.appendChild(svgEl('path', { d: 'M10 11v5m4-5v5' }));
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

  // Banner peringatan persistensi/import — di luar panel agar tidak hilang saat render.
  const bannerHost = createEl('div', 'container banner-host');
  bannerHost.setAttribute('aria-live', 'polite');
  root.appendChild(bannerHost);

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

  // Modal dibuat sekali di awal agar bisa dibuka dari kartu/baris mana pun.
  createDetailModal();
  buildFormModal();

  return {
    tabs: [tabKatalog, tabDashboard],
    panels: { katalog: katalogPanel, dashboard: dashboardPanel },
    katalogPanel,
    gridHost,
    controls,
    resultCount,
    bannerHost,
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

/* ------------------------------------------------------------
   Dashboard pengelola (M5): statistik + daftar/CRUD
   ------------------------------------------------------------ */

function withFallback(image) {
  image.onerror = () => {
    if (image.dataset.fallback !== '1') {
      image.dataset.fallback = '1';
      image.src = FALLBACK_IMAGE;
    }
  };
  return image;
}

/** Select status dipakai ulang di baris tabel dan kartu mobile. */
function createStatusSelect(product) {
  const status = STATUS.includes(product.status) ? product.status : 'Perawatan';
  const select = createEl('select', `status-select status-select--${STATUS_SLUG[status]}`);
  STATUS.forEach((option) => {
    const item = createEl('option', null, option);
    item.value = option;
    select.appendChild(item);
  });
  select.value = status;
  select.dataset.action = 'quick-status';
  select.dataset.id = product.id;
  select.dataset.focusKey = `${product.id}:status`;
  select.setAttribute('aria-label', `Ubah status ${product.nama}`);
  return select;
}

function createActionButtons(product) {
  const edit = createEl('button', 'btn btn-edit', '');
  edit.type = 'button';
  edit.dataset.action = 'open-form';
  edit.dataset.mode = 'edit';
  edit.dataset.id = product.id;
  edit.dataset.focusKey = `${product.id}:edit`;
  edit.appendChild(editIcon());
  edit.appendChild(createEl('span', null, 'EDIT'));

  const hapus = createEl('button', 'btn btn-hapus', '');
  hapus.type = 'button';
  hapus.dataset.action = 'delete-product';
  hapus.dataset.id = product.id;
  hapus.dataset.focusKey = `${product.id}:delete`;
  hapus.appendChild(trashIcon());
  hapus.appendChild(createEl('span', null, 'HAPUS'));
  return [edit, hapus];
}

function createManageIdentity(product) {
  const wrap = createEl('div', 'manage-kostum');
  const image = withFallback(createEl('img', 'thumb'));
  image.src = product.imageUrl || FALLBACK_IMAGE;
  image.alt = '';
  image.loading = 'lazy';
  const names = createEl('div');
  names.appendChild(createEl('strong', null, product.nama));
  names.appendChild(createEl('span', 'cell-sub', product.asal));
  append(wrap, image, names);
  return wrap;
}

/** Baris tabel desktop — semua teks dari data user lewat textContent. */
function createManageRow(product) {
  const row = createEl('tr');
  row.dataset.id = product.id;

  const kostum = createEl('td');
  kostum.appendChild(createManageIdentity(product));
  row.appendChild(kostum);
  row.appendChild(createEl('td', 'cell-enum', String(product.kategori).toUpperCase()));
  row.appendChild(createEl('td', 'cell-enum', String(product.ukuran).toUpperCase()));
  row.appendChild(
    createEl('td', 'cell-harga', `${formatRupiah(product.hargaPer2Hari)} / 2 HARI`),
  );
  row.appendChild(createEl('td', 'cell-stok', `STOK: ${product.stok}`));

  const statusCell = createEl('td');
  statusCell.appendChild(createStatusSelect(product));
  row.appendChild(statusCell);

  const actionCell = createEl('td');
  const actions = createEl('div', 'action-buttons');
  append(actions, ...createActionButtons(product));
  actionCell.appendChild(actions);
  row.appendChild(actionCell);
  return row;
}

/** Kartu manajemen untuk viewport < lg (UI-SPEC.md 3.6 / 5.3). */
function createManageCard(product) {
  const card = createEl('article', 'manage-card');
  card.dataset.id = product.id;

  const top = createEl('div', 'manage-card-top');
  top.appendChild(createManageIdentity(product));
  top.appendChild(createStatusBadge(product.status));
  card.appendChild(top);

  const meta = createEl('div', 'manage-card-meta');
  meta.appendChild(
    createEl('span', 'label', `${product.kategori} · ${product.ukuran} · STOK: ${product.stok}`),
  );
  meta.appendChild(createEl('span', 'label', `${formatRupiah(product.hargaPer2Hari)} / 2 HARI`));
  card.appendChild(meta);

  const statusField = createEl('label', 'field manage-card-status');
  statusField.appendChild(createEl('span', 'label', 'UBAH STATUS'));
  statusField.appendChild(createStatusSelect(product));
  card.appendChild(statusField);

  const actions = createEl('div', 'manage-card-actions');
  append(actions, ...createActionButtons(product));
  card.appendChild(actions);
  return card;
}

/** Render 3 kartu statistik + daftar manajemen (SPEC.md 4.3 / F3.1–F3.8). */
export function renderDashboard(container, stats, products = []) {
  const focusKey = container.contains(document.activeElement)
    ? document.activeElement.dataset.focusKey
    : null;
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

  // Toolbar data: export/import/reset — diletakkan di bagian atas dashboard.
  const toolbar = createEl('section', 'data-toolbar');
  const toolbarLabel = createEl('div', 'data-toolbar-label');
  toolbarLabel.appendChild(createEl('h3', 'label', 'DATA & CADANGAN'));
  toolbarLabel.appendChild(createEl('p', 'section-sub', 'CADANGAN LOKAL — FORMAT JSON.'));
  const toolbarActions = createEl('div', 'data-toolbar-actions');

  const ekspor = createEl('button', 'btn btn-export', 'EXPORT JSON');
  ekspor.type = 'button';
  ekspor.dataset.action = 'export-json';

  const impor = createEl('button', 'btn btn-import', 'IMPORT JSON');
  impor.type = 'button';
  impor.dataset.action = 'import-json';
  impor.dataset.focusKey = 'toolbar:import';

  const fileInput = createEl('input');
  fileInput.type = 'file';
  fileInput.accept = '.json,application/json';
  fileInput.hidden = true;
  fileInput.dataset.action = 'import-file';
  fileInput.setAttribute('aria-label', 'Pilih file cadangan JSON');

  const resetData = createEl('button', 'btn btn-reset-dummy label', 'RESET DATA DUMMY');
  resetData.type = 'button';
  resetData.dataset.action = 'reset-data';

  append(toolbarActions, ekspor, impor, fileInput, resetData);
  append(toolbar, toolbarLabel, toolbarActions);
  container.appendChild(toolbar);

  const manage = createEl('section', 'manage-panel');
  const manageHead = createEl('div', 'manage-head');
  const manageTitle = createEl('div');
  manageTitle.appendChild(createEl('h3', 'display manage-title', 'KELOLA KOSTUM'));
  manageTitle.appendChild(createEl('p', 'section-sub', `${products.length} kostum dalam katalog.`));
  const actions = createEl('div', 'manage-actions');
  const add = createEl('button', 'btn btn-primary', '+ TAMBAH KOSTUM');
  add.type = 'button';
  add.dataset.action = 'open-form';
  add.dataset.mode = 'tambah';
  actions.appendChild(add);
  append(manageHead, manageTitle, actions);
  manage.appendChild(manageHead);

  const tableWrap = createEl('div', 'table-wrap');
  const table = createEl('table', 'manage-table');
  const thead = createEl('thead');
  const headRow = createEl('tr');
  [
    'KOSTUM / ASAL',
    'KATEGORI',
    'UKURAN',
    'HARGA',
    'STOK',
    'STATUS',
    'AKSI',
  ].forEach((text) => {
    const cell = createEl('th', 'label', text);
    cell.scope = 'col';
    headRow.appendChild(cell);
  });
  thead.appendChild(headRow);
  const tbody = createEl('tbody');
  products.forEach((product) => tbody.appendChild(createManageRow(product)));
  table.append(thead, tbody);
  tableWrap.appendChild(table);
  manage.appendChild(tableWrap);

  const cardList = createEl('div', 'manage-card-list');
  products.forEach((product) => cardList.appendChild(createManageCard(product)));
  manage.appendChild(cardList);
  container.appendChild(manage);

  if (focusKey && typeof CSS !== 'undefined' && typeof CSS.escape === 'function') {
    const target = container.querySelector(`[data-focus-key="${CSS.escape(focusKey)}"]`);
    if (target) target.focus();
  }
}

/**
 * Validasi murni untuk form Tambah/Edit (SPEC.md 4.2).
 * `deskripsi` dan `imageUrl` yang kosong diisi default agar model tetap lengkap;
 * nama/asal tetap wajib. Tidak ada penulisan state di sini.
 */
export function validateProductDraft(raw = {}) {
  const errors = {};
  const text = (key) => String(raw[key] ?? '').trim();
  const nama = text('nama');
  const asal = text('asal');
  const kategori = text('kategori');
  const ukuran = text('ukuran');
  const status = text('status');
  const hargaRaw = text('hargaPer2Hari');
  const stokRaw = text('stok');

  if (nama.length < 3 || nama.length > 80) errors.nama = 'NAMA WAJIB DIISI (3–80 KARAKTER).';
  if (asal.length < 2 || asal.length > 80) errors.asal = 'ASAL WAJIB DIISI (2–80 KARAKTER).';
  if (!KATEGORI.includes(kategori)) errors.kategori = 'PILIH KATEGORI YANG VALID.';
  if (!UKURAN.includes(ukuran)) errors.ukuran = 'PILIH UKURAN YANG VALID.';

  let hargaPer2Hari = 100000;
  if (hargaRaw !== '') {
    const value = Number(hargaRaw);
    if (!Number.isInteger(value) || value < 0 || value > 100000000) {
      errors.hargaPer2Hari = 'HARGA HARUS ANGKA BULAT 0–100000000.';
    } else {
      hargaPer2Hari = value;
    }
  }

  let stok = 0;
  if (stokRaw === '') {
    errors.stok = 'STOK WAJIB DIISI (BILANGAN BULAT ≥ 0).';
  } else {
    const value = Number(stokRaw);
    if (!Number.isInteger(value) || value < 0 || value > 999) {
      errors.stok = 'STOK HARUS BILANGAN BULAT 0–999.';
    } else {
      stok = value;
    }
  }

  if (!STATUS.includes(status)) errors.status = 'PILIH STATUS YANG VALID.';

  let deskripsi = text('deskripsi');
  if (deskripsi === '') deskripsi = 'Lengkap: kostum, wig, dan aksesoris sesuai tema.';
  else if (deskripsi.length < 10 || deskripsi.length > 500) {
    errors.deskripsi = 'DESKRIPSI HARUS 10–500 KARAKTER.';
  }

  let imageUrl = text('imageUrl');
  if (imageUrl === '') imageUrl = PLACEHOLDER_IMAGE;
  else if (!/^\/images\/[A-Za-z0-9._/-]+\.(svg|png|jpe?g|webp)$/i.test(imageUrl)) {
    errors.imageUrl = 'PATH GAMBAR HARUS DI /images/ (SVG/PNG/JPG/WEBP).';
  }

  return {
    errors,
    values: {
      nama,
      asal,
      kategori,
      ukuran,
      hargaPer2Hari,
      stok,
      status,
      deskripsi,
      imageUrl,
      unggulan: Boolean(raw.unggulan),
    },
  };
}

/** Toast singkat untuk feedback aksi (SUCCESS / WARNING / ERROR). */
export function showToast(message, variant = 'success') {
  const previous = document.querySelector('.toast');
  if (previous) previous.remove();
  const toast = createEl('div', `toast toast--${variant}`, message);
  toast.setAttribute('role', 'status');
  document.body.appendChild(toast);
  window.setTimeout(() => toast.remove(), 3000);
}

/** Banner persisten untuk data rusak / storage mati / error import (M6). */
export function showBanner(message, tone = 'warning') {
  const host = document.querySelector('.banner-host');
  if (!host) return;
  host.replaceChildren();
  const banner = createEl('div', `banner banner--${tone}`);
  banner.setAttribute('role', 'alert');
  const close = createEl('button', 'banner-close', '✕');
  close.type = 'button';
  close.setAttribute('aria-label', 'Tutup pemberitahuan');
  close.addEventListener('click', hideBanner);
  append(banner, bannerIcon(), createEl('p', 'banner-text', message), close);
  host.appendChild(banner);
}

export function hideBanner() {
  const host = document.querySelector('.banner-host');
  if (host) host.replaceChildren();
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
  syncBodyModal();
  if (modalTrigger && modalTrigger.isConnected) modalTrigger.focus();
  modalTrigger = null;
  modalOnSimulate = null;
  if (detailModal) detailModal.product = null;
}

/* ------------------------------------------------------------
   Modal form Tambah/Edit kostum (M5)
   ------------------------------------------------------------ */

let formModal = null;
let formTrigger = null;
let formOnSave = null;

function syncBodyModal() {
  const detailOpen = detailModal && !detailModal.overlay.hidden;
  const formOpen = formModal && !formModal.overlay.hidden;
  document.body.classList.toggle('modal-open', Boolean(detailOpen || formOpen));
}

function registerFormField(grid, fields, key, labelText, control, full = false) {
  const wrap = createEl('div', `form-field${full ? ' form-field--full' : ''}`);
  if (!control.id) control.id = `form-${key}`;
  const label = createEl('label', 'label', labelText);
  label.htmlFor = control.id;
  const error = createEl('p', 'form-error label', '');
  error.id = `form-${key}-error`;
  error.hidden = true;
  control.setAttribute('aria-describedby', error.id);
  append(wrap, label, control, error);
  grid.appendChild(wrap);
  fields[key] = { wrap, control, error };
  return control;
}

function buildFormModal() {
  const overlay = createEl('div', 'modal-overlay');
  overlay.hidden = true;
  overlay.dataset.modal = 'form';

  const panel = createEl('div', 'modal-panel form-panel');
  panel.setAttribute('role', 'dialog');
  panel.setAttribute('aria-modal', 'true');
  panel.setAttribute('aria-labelledby', 'form-modal-title');

  const header = createEl('header', 'modal-header');
  const title = createEl('h2', 'display modal-title', 'TAMBAH KOSTUM');
  title.id = 'form-modal-title';
  const close = createEl('button', 'modal-close', '✕');
  close.type = 'button';
  close.setAttribute('aria-label', 'Tutup form kostum');
  append(header, title, close);

  const form = createEl('form', 'form-body');
  form.noValidate = true;
  const grid = createEl('div', 'form-grid');
  const fields = {};

  const nama = createEl('input', 'form-input');
  nama.type = 'text';
  nama.autocomplete = 'off';
  registerFormField(grid, fields, 'nama', 'NAMA KOSTUM / KARAKTER', nama);

  const asal = createEl('input', 'form-input');
  asal.type = 'text';
  asal.autocomplete = 'off';
  registerFormField(grid, fields, 'asal', 'ASAL SERIES', asal);

  const kategori = createEl('select', 'form-input form-select');
  KATEGORI.forEach((value) => {
    const option = createEl('option', null, value);
    option.value = value;
    kategori.appendChild(option);
  });
  registerFormField(grid, fields, 'kategori', 'KATEGORI', kategori);

  const ukuran = createEl('select', 'form-input form-select');
  UKURAN.forEach((value) => {
    const option = createEl('option', null, value);
    option.value = value;
    ukuran.appendChild(option);
  });
  registerFormField(grid, fields, 'ukuran', 'UKURAN', ukuran);

  const harga = createEl('input', 'form-input');
  harga.type = 'number';
  harga.min = '0';
  harga.step = '1';
  registerFormField(grid, fields, 'hargaPer2Hari', 'HARGA / 2 HARI (RP)', harga);

  const stok = createEl('input', 'form-input');
  stok.type = 'number';
  stok.min = '0';
  stok.step = '1';
  registerFormField(grid, fields, 'stok', 'STOK', stok);

  const status = createEl('select', 'form-input form-select');
  STATUS.forEach((value) => {
    const option = createEl('option', null, value);
    option.value = value;
    status.appendChild(option);
  });
  registerFormField(grid, fields, 'status', 'STATUS', status);

  const imageUrl = createEl('input', 'form-input');
  imageUrl.type = 'text';
  imageUrl.placeholder = '/images/placeholder.svg';
  registerFormField(grid, fields, 'imageUrl', 'PATH GAMBAR (OPSIONAL)', imageUrl);

  const deskripsi = createEl('textarea', 'form-input form-textarea');
  deskripsi.rows = 3;
  registerFormField(grid, fields, 'deskripsi', 'KELENGKAPAN KOSTUM (OPSIONAL)', deskripsi, true);

  const unggulan = createEl('input', 'form-check-input');
  unggulan.type = 'checkbox';
  unggulan.id = 'form-unggulan';
  unggulan.name = 'unggulan';
  const checkLabel = createEl('label', 'form-check form-field--full');
  checkLabel.htmlFor = unggulan.id;
  const checkError = createEl('p', 'form-error label', '');
  checkError.id = 'form-unggulan-error';
  checkError.hidden = true;
  unggulan.setAttribute('aria-describedby', checkError.id);
  append(checkLabel, unggulan, createEl('span', 'label', 'TANDAI SEBAGAI KOSTUM UNGGULAN'), checkError);
  grid.appendChild(checkLabel);
  fields.unggulan = { wrap: checkLabel, control: unggulan, error: checkError };

  const actions = createEl('div', 'form-actions');
  const batal = createEl('button', 'btn btn-cancel', 'BATAL');
  batal.type = 'button';
  const simpan = createEl('button', 'btn btn-primary', 'SIMPAN');
  simpan.type = 'submit';
  append(actions, batal, simpan);
  append(form, grid, actions);
  append(panel, header, form);
  overlay.appendChild(panel);
  document.body.appendChild(overlay);

  const refs = { overlay, panel, title, close, form, fields };
  form.addEventListener('submit', handleFormSubmit);
  close.addEventListener('click', closeProductFormModal);
  overlay.addEventListener('click', (event) => {
    if (event.target === overlay) closeProductFormModal();
  });

  formModal = refs;
  return refs;
}

function applyFormErrors(errors = {}) {
  if (!formModal) return;
  Object.entries(formModal.fields).forEach(([key, field]) => {
    const message = errors[key] || '';
    field.error.textContent = message;
    field.error.hidden = !message;
    field.wrap.classList.toggle('has-error', Boolean(message));
    if (message) field.control.setAttribute('aria-invalid', 'true');
    else field.control.removeAttribute('aria-invalid');
  });
}

function collectFormDraft() {
  const field = formModal.fields;
  return {
    nama: field.nama.control.value,
    asal: field.asal.control.value,
    kategori: field.kategori.control.value,
    ukuran: field.ukuran.control.value,
    hargaPer2Hari: field.hargaPer2Hari.control.value,
    stok: field.stok.control.value,
    status: field.status.control.value,
    imageUrl: field.imageUrl.control.value,
    deskripsi: field.deskripsi.control.value,
    unggulan: field.unggulan.control.checked,
  };
}

function handleFormSubmit(event) {
  event.preventDefault();
  if (!formModal) return;

  const result = validateProductDraft(collectFormDraft());
  applyFormErrors(result.errors);
  const errorKeys = Object.keys(result.errors);
  if (errorKeys.length > 0) {
    const first = formModal.fields[errorKeys[0]];
    if (first) first.control.focus();
    showToast('GAGAL MENYIMPAN. PERIKSA KEMBALI ISIAN FORM.', 'error');
    return;
  }

  const id = formModal.editId;
  const onSave = formOnSave;
  closeProductFormModal();
  if (typeof onSave === 'function') onSave(result.values, id);
}

/** Buka form Tambah (product=null) atau Edit; `trigger` untuk focus return. */
export function openProductForm(product, trigger, onSave) {
  if (!formModal) buildFormModal();
  formTrigger = trigger ?? null;
  formOnSave = typeof onSave === 'function' ? onSave : null;
  formModal.editId = product?.id ?? null;
  formModal.title.textContent = product ? 'EDIT KOSTUM' : 'TAMBAH KOSTUM';

  const source = product ?? {
    nama: '',
    asal: '',
    kategori: KATEGORI[0],
    ukuran: UKURAN[0],
    hargaPer2Hari: 100000,
    stok: 0,
    status: STATUS[0],
    imageUrl: '',
    deskripsi: '',
    unggulan: false,
  };
  const field = formModal.fields;
  field.nama.control.value = source.nama ?? '';
  field.asal.control.value = source.asal ?? '';
  field.kategori.control.value = source.kategori ?? KATEGORI[0];
  field.ukuran.control.value = source.ukuran ?? UKURAN[0];
  field.hargaPer2Hari.control.value = String(source.hargaPer2Hari ?? 100000);
  field.stok.control.value = String(source.stok ?? 0);
  field.status.control.value = source.status ?? STATUS[0];
  field.imageUrl.control.value = source.imageUrl ?? '';
  field.deskripsi.control.value = source.deskripsi ?? '';
  field.unggulan.control.checked = Boolean(source.unggulan);
  applyFormErrors({});

  formModal.overlay.hidden = false;
  syncBodyModal();
  field.nama.control.focus();
}

export function closeProductFormModal() {
  if (!formModal || formModal.overlay.hidden) return;
  formModal.overlay.hidden = true;
  syncBodyModal();
  if (formTrigger && formTrigger.isConnected) formTrigger.focus();
  formTrigger = null;
  formOnSave = null;
  formModal.editId = null;
}

/** Pasang handler Esc sekali (dipanggil dari main.js); form lebih prioritas. */
export function bindModalKeyboard() {
  document.addEventListener('keydown', (event) => {
    if (event.key !== 'Escape') return;
    if (formModal && !formModal.overlay.hidden) {
      event.preventDefault();
      closeProductFormModal();
      return;
    }
    if (detailModal && !detailModal.overlay.hidden) {
      event.preventDefault();
      closeDetailModal();
    }
  });
}
