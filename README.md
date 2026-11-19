# Costestant — Katalog & Kalkulator Sewa Kostum Cosplay

**Costestant** adalah aplikasi web statis berupa **katalog sewa kostum cosplay sekaligus kalkulator biaya sewa**. Pengunjung dapat mencari kostum, melihat detail dan estimasi harga, lalu melanjutkan pemesanan melalui WhatsApp dengan pesan yang sudah terisi otomatis. Tampilannya bergaya **Persona 4** — kuning menyala, hitam pekat, border tebal, *hard shadow*, dan aksen *scanline* — diimplementasikan dengan CSS custom variables tanpa framework UI.

Tarif dasar dihitung **per paket 2 hari** (`hargaPer2Hari`). Hari tambahan dihitung `ceil(hargaPer2Hari / 2)` per hari, dengan durasi yang dibatasi **2–30 hari**.

> Ini adalah **prototipe client-side**. Seluruh data disimpan di browser pengguna. Lihat bagian **Keterbatasan Aplikasi** sebelum digunakan untuk kebutuhan produksi.

---

## Fitur Utama yang Tersedia

### 1. Katalog 8 kostum contoh
Delapan data dummy fiktif dan nonpribadi (`src/products.js`), masing-masing dengan nama, asal series, kategori, ukuran, tarif per 2 hari, stok, status, deskripsi, dan ilustrasi SVG lokal:

Luna Silver, Blaze Runner, Captain Nova, Iron Warden, Mecha Aurora, Ultra Vanguard, Crimson Rider, dan Starlight Wanderer.

Tombol **RESET DATA DUMMY** mengembalikan katalog ke 8 data awal ini.

### 2. Pencarian dan filter
- Pencarian **case-insensitive** pada nama kostum dan asal series, tersedia di hero dan di bar filter (state yang sama).
- Filter **kategori** (Anime, Game, Tokusatsu, Original), **ukuran** (S, M, L, XL, All Size), dan **status** (Tersedia, Sedang Disewa, Perawatan). Kombinasi kriteria bersifat **AND**.
- Pengurutan: **Kostum Unggulan**, **Harga Terendah**, **Harga Tertinggi**, dan **Nama A–Z**.
- Tombol **HAPUS FILTER** mengembalikan semua kriteria ke nilai default.

### 3. Modal detail & kalkulator sewa otomatis
Kartu kostum membuka modal berisi informasi lengkap, tanggal mulai, dan durasi sewa (2–30 hari) dengan tombol `−`/`+` serta preset. Rincian yang dihitung ulang secara langsung:

- tarif paket 2 hari,
- jumlah hari tambahan × tarif harian (`ceil(harga / 2)`),
- **total biaya** dalam format Rupiah `id-ID`.

Tersedia pula **simulasi sewa** untuk kostum yang statusnya `Tersedia` dan stoknya lebih dari 0: stok berkurang 1, dan bila stok habis status berubah menjadi `Sedang Disewa`.

### 4. Pemesanan via WhatsApp
Tautan `wa.me` dibuat dengan pesan **pre-filled** yang memuat nama kostum, asal, ukuran, tanggal mulai, durasi, dan estimasi biaya. Pesan di-encode dengan `encodeURIComponent()`, tautan dibuka di tab baru dengan `rel="noopener noreferrer"`. Nomor tujuan saat ini masih **placeholder `6281234567890`**.

### 5. Dashboard pengelola (mode demo)
Tab **DASHBOARD PENGELOLA** menampilkan kartu statistik (total katalog, unit stok tersedia, kostum sedang disewa), tabel dan kartu daftar kostum, serta aksi:

- tambah kostum via form modal dengan validasi,
- edit dan hapus kostum (hapus memakai konfirmasi),
- ubah status cepat melalui select,
- reset seluruh data ke 8 dummy awal (dengan konfirmasi).

### 6. Export, import, dan cadangan JSON
- **EXPORT JSON** mengunduh `costestant-backup.json` memakai `Blob` + object URL.
- **IMPORT JSON** membaca berkas `.json`, lalu memvalidasi ukuran (maksimal 1 MB), MIME, jumlah item (maksimal 500), dan skema tiap kostum sebelum menyimpan. Data yang tidak valid ditolak tanpa mengubah state.
- Data yang rusak atau tidak sesuai skema di `localStorage` otomatis dipulihkan ke 8 data contoh dengan pesan peringatan.

---

## Tech Stack & Struktur Proyek

### Teknologi yang terpasang
Berdasarkan `package.json`:

| Item | Versi / Nilai | Keterangan |
|---|---|---|
| Node package type | `module` | ES modules (`import`/`export`) |
| `vite` | `^7.0.0` (devDependency) | Dev server & bundler produksi |
| `vitest` | `^5.1.1` (devDependency) | Unit test runner (`vitest run`) |

Script yang tersedia: `npm run dev`, `npm run build`, `npm run preview`, `npm test`.

Tidak ada dependency runtime, tidak ada Tailwind/PostCSS, dan tidak ada `vite.config.js` — Vite memakai konfigurasi default. Font **Poppins** dimuat dari Google Fonts melalui `<link>` di `index.html` (bukan paket npm).

### Peta berkas

| Berkas | Fungsi |
|---|---|
| `index.html` | Shell HTML, meta CSP, font Google Fonts, mount point `#app`, entry `/src/main.js` |
| `src/main.js` | Entry point: event handling, routing dua tab, kalkulator–WhatsApp wiring, export/import JSON, toast & banner |
| `src/products.js` | 8 data seed, konstanta (kategori/ukuran/status), `filterProducts()`, kalkulator sewa, `formatRupiah()`, validator & pembuat URL WhatsApp |
| `src/store.js` | State management, validasi & sanitasi skema, persistensi `localStorage`, CRUD kostum, export/import, helper keamanan (`BATAS_SKEMA`, `isValidImagePath`, `validateImportFile`) |
| `src/ui.js` | Render DOM (katalog, filter bar, dashboard, modal detail & form), validasi form, status badge, toast/banner |
| `src/style.css` | Design system Persona 4: CSS custom variables, token warna/border/shadow, layout responsif |
| `tests/costestant.test.js` | Suite Vitest (31 kasus) |
| `public/images/*.svg` | 9 ilustrasi lokal: `kostum-01.svg`–`kostum-08.svg` dan `placeholder.svg` |
| `package.json`, `package-lock.json` | Definisi skrip, dependency, dan lockfile |
| `SPEC.md`, `UI-SPEC.md`, `TASKS.md` | Spesifikasi fungsional, spesifikasi antarmuka, dan catatan milestone |

---

## Cara Instalasi & Menjalankan Lokal

```bash
git clone <URL_REPOSITORY>.git
cd costestant
npm install
npm run dev
```

`npm run dev` menjalankan Vite dev server. Buka URL yang ditampilkan di terminal (biasanya `http://localhost:5173`).

---

## Cara Menjalankan Pengujian (Testing)

```bash
npm test
```

Perintah ini menjalankan `vitest run` (mode sekali jalan, bukan watch). Saat ini ada **31 test** dalam satu file yang mencakup:

- pencarian case-insensitive dan filter AND kategori/ukuran/status,
- pengurutan `harga-asc`, `harga-desc`, `nama-asc`, empty result, dan non-mutasi array,
- batas skema: harga `0`/`100000000`, stok `0`/`999`, penolakan angka negatif, desimal, dan enum invalid,
- kalkulator sewa (durasi genap/ganjil, clamp, pembulatan tarif harian) dan `buildWhatsAppUrl()` (validasi nomor + encoding pesan),
- parser dan pemulihan `localStorage` (JSON rusak, skema invalid, array kosong, mutasi tersimpan),
- security test: path gambar berbahaya, kunci `__proto__`/`constructor`, batas ukuran payload, validasi file impor, direktif CSP, dan atribut `crossorigin` font.

---

## Cara Production Build

```bash
npm run build
npm run preview
```

`npm run build` menghasilkan folder `dist/` berisi `index.html`, `assets/` (JS & CSS dengan hash nama file), dan `images/` (9 SVG). `npm run preview` melayani hasil build tersebut secara lokal untuk pengecekan akhir.

Output build terakhir: `index.html` 1,36 kB, CSS 24,79 kB (gzip 4,90 kB), JS 44,40 kB (gzip 15,01 kB).

---

## Panduan Deployment Statis

Karena hasil build murni statis, folder **`dist/`** bisa diunggah ke layanan hosting apa pun yang mendukung static site.

### Vercel
1. Import repository melalui dashboard Vercel.
2. Framework preset: **Vite**.
3. Build command: `npm run build`; output directory: `dist`.
4. Deploy.

### Netlify
1. **Add new site → Import an existing project** dan hubungkan repository.
2. Build command: `npm run build`; publish directory: `dist`.
3. Deploy.

### GitHub Pages
1. Jalankan `npm run build`.
2. Untuk halaman di **domain root** (`<username>.github.io`), unggah isi folder `dist/` ke branch `gh-pages`, lalu aktifkan GitHub Pages dari branch tersebut.
3. Untuk halaman pada **subpath repository** (`<username>.github.io/<nama-repo>/`), tambahkan `vite.config.js` dengan `base: '/<nama-repo>/'` sebelum build. Proyek ini saat ini **belum** memiliki `vite.config.js`, jadi tanpa penyesuaian itu aset mutlak seperti `/assets/...` dan `/images/...` tidak akan dimuat pada subpath.

### Smoke test setelah deploy
Buka URL publik dengan browser/profile yang masih bersih, lalu pastikan 8 kartu tampil, pencarian dan filter bekerja, modal kalkulator menampilkan total, tautan WhatsApp terbuka, tambah/edit/hapus/reset berfungsi, dan Console tidak menampilkan error 404 untuk aset gambar.

---

## Keterbatasan Aplikasi (Batasan Prototipe)

1. **Penyimpanan lokal saja.** Data kostum disimpan di `localStorage` browser dengan key `costestant:costumes:v1`, sehingga hanya tersimpan di perangkat/browser masing-masing dan **tidak tersinkronisasi antar perangkat**.
2. **Tanpa backend dan login.** Tidak ada server, database terpusat, maupun sistem autentikasi. **Dashboard Pengelola bersifat mode demo terbuka** — siapa pun yang membuka halaman dapat mengubah data lokalnya sendiri.
3. **Pemesanan manual via WhatsApp.** Transaksi diteruskan ke WhatsApp dengan pesan pre-filled; **tidak ada payment gateway** dan **tidak ada penguncian jadwal otomatis di server**. Nomor WA masih placeholder `6281234567890` dan harus diganti sebelum produksi.
4. **Gambar bersifat ilustrasi lokal.** Kostum memakai placeholder/ilustrasi SVG buatan lokal yang nonpribadi, **bukan foto berhak cipta**, dan tidak menautkan aset karakter resmi.
