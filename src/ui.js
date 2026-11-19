/**
 * ui.js — Render komponen DOM + sanitasi teks anti-XSS.
 * Semua nilai dinamis ditulis lewat textContent, bukan innerHTML
 * (SPEC.md 4.2.8 / R3).
 */
import { STATUS } from './products.js';

/**
 * Gambar placeholder inline untuk pratinjau Milestone 1.
 * Aset SVG asli di public/images dipakai mulai Milestone 2,
 * sehingga scaffold ini tidak menghasilkan request 404.
 */
const PREVIEW_IMAGE = `data:image/svg+xml,${encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" width="400" height="500" viewBox="0 0 400 500">' +
    '<rect width="400" height="500" fill="#F3F4F6"/>' +
    '<rect width="400" height="12" fill="#111111"/>' +
    '<rect x="36" y="176" width="328" height="148" fill="#FFE600" stroke="#111111" stroke-width="6"/>' +
    '<text x="200" y="242" text-anchor="middle" font-family="Poppins,Arial,sans-serif" font-size="26" font-weight="800" fill="#111111">COSTESTANT</text>' +
    '<text x="200" y="282" text-anchor="middle" font-family="Poppins,Arial,sans-serif" font-size="14" font-weight="700" fill="#111111">PRATINJAU KOSTUM</text>' +
    '</svg>',
)}`;

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

/** Formatter Rupiah id-ID, satu source of truth untuk seluruh UI. */
export function formatRupiah(value) {
  const amount = Number(value);
  if (!Number.isFinite(amount)) return 'Rp 0';
  return `Rp ${new Intl.NumberFormat('id-ID', { maximumFractionDigits: 0 }).format(amount)}`;
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

function starIcon() {
  const ns = 'http://www.w3.org/2000/svg';
  const svg = document.createElementNS(ns, 'svg');
  svg.setAttribute('width', '16');
  svg.setAttribute('height', '16');
  svg.setAttribute('viewBox', '0 0 24 24');
  svg.setAttribute('fill', 'currentColor');
  svg.setAttribute('stroke', '#111111');
  svg.setAttribute('stroke-width', '1');
  const path = document.createElementNS(ns, 'path');
  path.setAttribute('d', 'M12 2l3.1 6.3 6.9 1-5 4.9 1.2 6.8L12 17.8 5.8 21l1.2-6.8-5-4.9 6.9-1L12 2z');
  svg.appendChild(path);
  return svg;
}

/** Satu komponen StatusBadge yang dipakai ulang di kartu, modal, dashboard. */
export function createStatusBadge(status) {
  const safeStatus = STATUS.includes(status) ? status : 'Perawatan';
  const badge = createEl('span', `badge ${STATUS_CLASS[safeStatus]}`);
  badge.appendChild(createEl('span', 'un-skew', STATUS_LABEL[safeStatus]));
  return badge;
}

function createKostumCard(product) {
  const card = createEl('article', 'kostum-card');

  const media = createEl('div', 'kostum-media');
  const image = createEl('img');
  image.src = PREVIEW_IMAGE;
  image.alt = `Ilustrasi kostum ${product.nama} dari ${product.asal}`;
  image.loading = 'lazy';
  image.onerror = () => {
    if (image.src !== PREVIEW_IMAGE) image.src = PREVIEW_IMAGE;
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
  card.appendChild(media);

  card.appendChild(createEl('div', 'ribbon-harga', `${formatRupiah(product.hargaPer2Hari)} / 2 HARI`));

  const body = createEl('div', 'kostum-body');
  body.appendChild(createEl('h3', null, product.nama));
  body.appendChild(createEl('p', 'kostum-meta', `${product.kategori} · ${product.ukuran}`));

  const foot = createEl('div', 'kostum-foot');
  foot.appendChild(createEl('span', 'kostum-stok', `STOK: ${product.stok}`));
  foot.appendChild(createStatusBadge(product.status));
  body.appendChild(foot);
  card.appendChild(body);
  return card;
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

  const search = createEl('div', 'hero-search');
  const searchInput = createEl('input');
  searchInput.type = 'search';
  searchInput.placeholder = 'CARI KARAKTER ATAU SERIES...';
  searchInput.setAttribute('aria-label', 'Cari karakter atau series');
  const searchButton = createEl('button', 'btn btn-dark', 'CARI');
  searchButton.type = 'button';
  append(search, searchInput, searchButton);
  heroInner.appendChild(search);
  heroInner.appendChild(createEl('p', 'hero-hint', 'Pencarian penuh tersedia di Milestone 3.'));

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
  const dashboard = createEl('div');
  katalogPanel.appendChild(katalog);
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

  return {
    tabs: [tabKatalog, tabDashboard],
    panels: { katalog: katalogPanel, dashboard: dashboardPanel },
    katalogPanel,
    katalog,
    dashboard,
    stockNumber,
    searchInput,
    searchButton,
    cta,
  };
}

/** Render pratinjau token desain + 8 kartu kostum di panel Katalog. */
export function renderKatalog(container, products) {
  container.replaceChildren();

  const head = createEl('div', 'section-heading');
  const headLeft = createEl('div');
  headLeft.appendChild(createEl('h2', 'display section-title', 'KATALOG KOSTUM'));
  headLeft.appendChild(
    createEl('p', 'section-sub', 'Pratinjau sistem desain Persona 4 dan 8 data dummy kostum.'),
  );
  head.appendChild(headLeft);
  head.appendChild(createEl('span', 'label result-count', `${products.length} KOSTUM`));
  container.appendChild(head);

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
  const hardBox = createEl('span', 'badge badge--kuning hard-shadow label', 'HARD BORDER + SHADOW');
  badgeRow.appendChild(hardBox);
  tokens.appendChild(badgeRow);
  container.appendChild(tokens);

  container.appendChild(createEl('h3', 'label grid-label', 'PRATINJAU KARTU KOSTUM'));
  const grid = createEl('div', 'grid-kostum');
  products.forEach((product) => grid.appendChild(createKostumCard(product)));
  container.appendChild(grid);
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
