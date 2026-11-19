# TASKS.md — Costestant: Roadmap Eksekusi 1 Hari

> Dokumen eksekusi turunan dari `SPEC.md` (perilaku, data, logika) dan `UI-SPEC.md` (visual, state, wireframe).
> Versi: `1.0` — Target: prototyping 1 hari — **Belum ada kode aplikasi pada tahap ini.**
> Aturan: **1 checkbox = 1 tugas**. Centang hanya jika ketiga bagian (Deskripsi, AC, File) sudah terpenuhi.

---

## Cara Pakai & Konvensi

- Jalankan milestone **berurutan**. Jangan lanjut sebelum "Gate Keluar" milestone sebelumnya lolos.
- **AC** di bawah merujuk ke `SPEC.md` Bagian 8 (`A1–F5`) dan `UI-SPEC.md` Bagian 3–6.
- Semua path relatif terhadap root proyek. Penanda `(baru)` = file belum ada di struktur `SPEC.md` 5.1.
- **Catatan urutan:** Milestone 2–5 memakai **state in-memory dari seed**. Milestone 6 menghubungkan state itu ke `localStorage`. Jadi AC yang mensyaratkan "tetap setelah refresh" baru diwajibkan penuh di **M6**.
- **Gate keluar global:** tidak ada login, tidak ada backend, tidak ada API key, nomor WA hanya `6281234567890` (placeholder), dan tidak ada fitur di luar `SPEC.md` Bagian 7.

## Ringkasan Milestone & Estimasi Waktu

| # | Milestone | Estimasi | Output Utama | AC Kunci |
|---|---|---:|---|---|
| 1 | Scaffold & Setup Desain Persona 4 | 50 mnt | Vite + Tailwind + token + 2 tab | F3 parsial |
| 2 | Data Dummy & Halaman Katalog | 70 mnt | 8 seed, aset SVG, Navbar, Hero, Grid | A1–A2, E1 parsial |
| 3 | Interaksi Pencarian, Filter & Sorting | 45 mnt | Pipeline cari→filter→sort + empty state | B1–B10 |
| 4 | Modal Detail, Kalkulator & WhatsApp | 65 mnt | Modal, hitung sewa, wa.me, simulasi | C1–C8, D1–D4 |
| 5 | Dashboard Demo Pengelola (CRUD) | 75 mnt | Statistik, tabel, form, status, hapus | E1–E7 (in-memory) |
| 6 | Persistensi localStorage & Reset | 40 mnt | `storage.js`, auto-reseed, reset penuh | E2/E4/E7 penuh, F4 |
| 7 | Testing Manual & Responsivitas | 60 mnt | UAT A–F, breakpoint, kontras | A1–F5 |
| 8 | Security & Sanitasi Input | 30 mnt | Anti-XSS, validasi angka, audit rahasia | E3, F5, D3 |
| 9 | Production Build | 25 mnt | `dist/`, preview bersih, aset optimum | F3, NFR2 |
| 10 | Deployment | 25 mnt | Config + `DEPLOY.md` + smoke test publik | Semua ✅ |

**Total fokus ≈ 8 jam 5 menit + buffer ±45 menit.** Jika waktu mepet, prioritize **M1 → M4 → M5 → M6 → M7**; M8–M10 menyusul.

---

## Milestone 1 — Scaffold & Setup Desain Persona 4 (~50 menit)

**Tujuan:** Proyek Vite berjalan dengan sistem desain Persona 4 aktif sebelum fitur apa pun ditulis.
**Gate masuk:** Folder kerja kosong / hanya berisi `SPEC.md`, `UI-SPEC.md`, `TASKS.md`.
**Gate keluar:** `npm run dev` membuka halaman bertema kuning-hitam, 2 tab bisa diklik, Console bersih.

> **Catatan implementasi (M1):** Mengikuti opsi ringan pada instruksi eksekusi, Tailwind/PostCSS tidak dipasang. Design token ditulis sebagai CSS custom variables di `src/style.css`, dan modul disusun sebagai `src/products.js`, `src/store.js`, `src/ui.js`, `src/main.js` (tanpa `vite.config.js`, `tailwind.config.js`, `postcss.config.js`, `src/styles.css`, `src/data/`, `src/ui/`). Gate keluar M1 tetap terpenuhi.

- [x] **T1.1 — Inisialisasi proyek Vite (Vanilla JS)**
  - **Deskripsi:** Buat `package.json` dengan script `dev`, `build`, `preview`; pasang Vite; `index.html` minimal dengan `<div id="app">` dan `<script type="module" src="/src/main.js">`.
  - **AC (manual browser):** Buka URL Vite (default `http://localhost:5173`) → halaman kosong tampil tanpa 404; DevTools → Console tidak ada error `Failed to resolve module`; tidak muncul prompt login.
  - **File:** `package.json`, `index.html`, `vite.config.js`, `.gitignore` (baru)

- [x] **T1.2 — Pasang & konfigurasi Tailwind CSS via PostCSS**
  - **Deskripsi:** Tambah Tailwind + PostCSS, buat `src/styles.css` berisi `@tailwind base/components/utilities`, import dari `main.js`.
  - **AC (manual browser):** Utility Tailwind langsung bekerja (mis. `bg-[#FFE600]` mengubah latar jadi kuning); mengubah `styles.css` memicu hot reload tanpa refresh manual.
  - **File:** `tailwind.config.js`, `postcss.config.js`, `src/styles.css`, `src/main.js`

- [x] **T1.3 — Definisikan design token Persona 4**
  - **Deskripsi:** Di `tailwind.config.js`, daftarkan warna (`yellow #FFE600`, `yellowSoft #FACC15`, `ink #111111`, `paper #FFFFFF`, `static #F3F4F6`, `alert #E60012`, `emerald #10B981`, `muted #4B5563`), `fontFamily.poppins`, `boxShadow.hard/hardLg/press/yellow`, dan ketebalan border 3px.
  - **AC (manual browser):** Halaman uji sementara menampilkan badge kuning dengan teks **hitam** (bukan putih), kartu putih ber-border hitam 3px, dan bayangan keras `4px 4px 0 #111111` tanpa blur.
  - **File:** `tailwind.config.js`, `src/styles.css`, `index.html`

- [x] **T1.4 — Tipografi global + efek scanline**
  - **Deskripsi:** Muat Poppins (via `@import`/link font), atur label UPPERCASE 11px `letter-spacing .06em`, deskripsi sentence case, dan utility `.scanlines` (garis 1px tiap 4px, `pointer-events: none`, opacity ~0.12).
  - **AC (manual browser):** Teks headline tampil tebal geometris; label badge terbaca UPPERCASE; overlay scanline terlihat tipis tetapi tombol di bawahnya tetap bisa diklik (uji klik tombol uji).
  - **File:** `index.html`, `src/styles.css`

- [x] **T1.5 — Struktur folder + enum + routing 2 tab**
  - **Deskripsi:** Buat struktur sesuai `SPEC.md` 5.1; isi konstanta `KATEGORI`, `UKURAN`, `STATUS`, `WHATSAPP_NUMBER = '6281234567890'` (komentar `PLACEHOLDER`); navbar sederhana mengganti panel Katalog/Dashboard tanpa reload.
  - **AC (manual browser):** Folder `src/data`, `src/ui`, `public/images` ada; klik tab **KATALOG KOSTUM** ⇄ **DASHBOARD PENGELOLA** mengganti konten tanpa URL berubah; tab aktif berlatar hitam-teks kuning; Console bersih.
  - **File:** `src/main.js`, `src/data/seed.js`, `src/ui/components.js` (baru), `src/ui/layout.js` (baru)

---

## Milestone 2 — Data Dummy & Halaman Katalog Kostum (~70 menit)

**Tujuan:** Katalog statis yang sudah terlihat persis seperti wireframe `UI-SPEC.md` 4.1 / 5.1.
**Gate masuk:** Gate M1 lolos.
**Gate keluar:** 8 kartu tampil lengkap dengan badge, harga, stok, status; statistik 8 / 17 / 1 muncul.

> **Catatan implementasi (M2):** Sesuai instruksi eksekusi dan batasan IP di `UI-SPEC.md` Bagian 0, 8 seed memakai **nama kostum/series fiktif** (bukan tabel 4.6 yang memakai karakter berhak cipta). Komposisi tetap 8 data, 3 `unggulan`, stok tersedia 17, 1 `Sedang Disewa`, dan mayoritas harga `100000`, sehingga angka 8 / 17 / 1 tetap valid. Kata kunci contoh AC B1–B9 perlu disesuaikan dengan nama fiktif saat M3. Ilustrasi dibuat lokal sebagai 9 SVG di `public/images` (tanpa fetch eksternal).

- [x] **T2.1 — Tulis 8 data contoh kostum nonpribadi**
  - **Deskripsi:** Ekspor `KOSTUM_SEED` dari `src/data/seed.js` berisi 8 objek persis tabel `SPEC.md` 4.6 (id UUID unik, `hargaPer2Hari`, `stok`, `status`, `unggulan`, `imageUrl`). `deskripsi` bahasa Indonesia menyebut wig/aksesoris/senjata.
  - **AC (manual browser):** Di Console, `import('/src/data/seed.js').then(m => console.log(m.KOSTUM_SEED.length))` menghasilkan **8**; tidak ada nama/nomor/alamat pribadi; 3 kostum ber-`unggulan: true`.
  - **File:** `src/data/seed.js`

- [x] **T2.2 — Buat 9 aset placeholder SVG lokal**
  - **Deskripsi:** Buat `kostum-01.svg` … `kostum-08.svg` (ilustrasi pop-art sederhana: topeng/wig/siluet, kuning-hitam-merah) dan `placeholder.svg` generik di `public/images`.
  - **AC (manual browser):** Buka langsung `http://localhost:5173/images/kostum-01.svg` dan `/images/placeholder.svg` → gambar tampil, bukan 404/teks error; total ukuran ke-9 file < 100 KB.
  - **File:** `public/images/kostum-01.svg`, `public/images/kostum-02.svg`, `public/images/kostum-03.svg`, `public/images/kostum-04.svg`, `public/images/kostum-05.svg`, `public/images/kostum-06.svg`, `public/images/kostum-07.svg`, `public/images/kostum-08.svg`, `public/images/placeholder.svg`

- [x] **T2.3 — Navbar: logo miring, nav, stock chip**
  - **Deskripsi:** Render per `UI-SPEC.md` 3.1: badge `COSTESTANT` kuning skew `-6deg` + shadow keras, 2 item nav UPPERCASE, chip `STOK: 17` dihitung dari seed dengan rumus `SPEC.md` 4.3.
  - **AC (manual browser):** Logo miring & berbayang keras; chip menampilkan **17**; hover nav → latar kuning; navbar tetap menempel saat halaman di-scroll; di 375px navbar jadi 2 baris (logo+angka, lalu 2 tombol tab).
  - **File:** `src/ui/layout.js`, `src/main.js`, `src/styles.css`

- [x] **T2.4 — Hero section + search bar + CTA**
  - **Deskripsi:** Render per `UI-SPEC.md` 3.2: latar kuning + scanline, headline `SEWA KOSTUM COSPLAY`, tagline, input `CARI KARAKTER ATAU SERIES...`, tombol `CARI`, CTA `LIHAT KATALOG`, hiasan `CHANNEL 04 // RENTAL`.
  - **AC (manual browser):** Teks di atas kuning berwarna hitam dan terbaca; tombol `CARI` hitam-teks kuning; klik `LIHAT KATALOG` menggulung halus ke grid; tombol tetap bisa diklik meski ada overlay scanline.
  - **File:** `src/ui/layout.js`, `src/styles.css`

- [x] **T2.5 — Grid kartu + StatusBadge + ribbon harga**
  - **Deskripsi:** Render 8 kartu `aspect-[4/5]` per `UI-SPEC.md` 3.4: badge asal, bintang unggulan, tag ukuran, ribbon `RP 100.000 / 2 HARI`, nama, stok, badge status, tombol `LIHAT DETAIL`. Satu komponen `StatusBadge` dipakai ulang.
  - **AC (manual browser):** **A1, A2** lolos: tepat 8 kartu; 3 variasi warna badge (emerald/merah/abu); bintang hanya di 3 kartu; gambar tidak broken; hover kartu naik dengan shadow 6px; di 1280px tampil 4 kolom, di 375px 1 kolom.
  - **File:** `src/ui/catalog.js`, `src/ui/components.js`, `src/styles.css`

- [x] **T2.6 — Kerangka Dashboard + 3 kartu statistik dari seed**
  - **Deskripsi:** Buat panel dashboard dengan 3 kartu per `UI-SPEC.md` 3.6; hitung `totalKatalog`, `unitStokTersedia`, `kostumDisewa` dari array seed (rumus `SPEC.md` 4.3).
  - **AC (manual browser):** Buka tab Dashboard → angka **8 / 17 / 1**; strip atas kartu berturut-turut kuning / emerald / merah; Samus (Perawatan, stok 0) dan Luffy (Disewa) tidak masuk angka 17.
  - **File:** `src/ui/dashboard.js`, `src/main.js`, `src/styles.css`

---

## Milestone 3 — Interaksi Pencarian, Filter & Sorting (~45 menit)

**Tujuan:** Pipeline `cari → filter → sort` (R11) bekerja real-time tanpa request jaringan.
**Gate masuk:** 8 kartu sudah tampil.
**Gate keluar:** AC B1–B10 lolos.

> **Catatan implementasi (M3):** Fungsi murni `filterProducts(products, criteria)` diekspor dari `src/products.js` (bukan modul baru). Satu source of truth untuk kriteria ada di `src/store.js` (`getCriteria` / `setCriteria` / `resetCriteria`), bukan `src/state.js` terpisah, agar tetap mengikuti struktur file M1/M2. Seluruh AC dijalankan dengan kata kunci **nama fiktif** (mis. `luna` menggantikan `naruto`, ` Nova` menggantikan `kamen`, `aurora` menggantikan `witcher`) karena seed M2 memakai kostum nonpribadi. Selain itu ditambahkan opsi sort `nama-asc` sesuai instruksi eksekusi. Bar filter bersifat statis saat grid di-render ulang agar fokus input tidak reset.

- [x] **T3.1 — State pusat pencarian/filter/sort**
  - **Deskripsi:** Buat `src/state.js` sebagai satu source of truth (`{ query, kategori, ukuran, status, sort }`); hubungkan input hero dan input filter bar ke state yang sama; `main.js` menurunkan state ke `catalog.js`.
  - **AC (manual browser):** Ketik `luffy` di hero → input di bar filter otomatis ikut terisi `luffy`; hapus di filter → hero ikut kosong; pipeline tetap urut cari→filter→sort saat dikombinasikan.
  - **File:** `src/state.js` (baru), `src/main.js`, `src/ui/layout.js`, `src/ui/catalog.js`

- [x] **T3.2 — Pencarian real-time nama atau asal series**
  - **Deskripsi:** Terapkan `toLowerCase().includes()` pada `nama` **ATAU** `asal`; update grid langsung saat `input` (tanpa tombol).
  - **AC (manual browser):** **B1, B2, B3** lolos: `naruto` → 1 kartu; `witcher` → Geralt; `NARUTO` kapital → tetap ketemu; menghapus teks → 8 kartu kembali.
  - **File:** `src/ui/catalog.js`, `src/state.js`

- [x] **T3.3 — Filter kategori, ukuran, status (AND)**
  - **Deskripsi:** Pasang chip kategori, select ukuran, select status; gabungan filter bersifat AND; chip aktif kuning miring + shadow keras.
  - **AC (manual browser):** **B4, B5, B6, B7** lolos: Tokusatsu → 2 kartu; All Size → 2 kartu; Perawatan → hanya Samus; `kamen` + Tokusatsu + XL → tepat 1 kartu.
  - **File:** `src/ui/catalog.js`, `src/state.js`, `src/styles.css`

- [x] **T3.4 — Sorting 3 mode + counter hasil**
  - **Deskripsi:** Implementasi `Kostum Unggulan` (default: unggulan dulu, lalu nama A–Z), `Harga Terendah`, `Harga Tertinggi`; tampilkan teks `N HASIL` yang mengikuti hasil.
  - **AC (manual browser):** **B8, B9** lolos: termurah Starlight Wanderer (`Rp 90.000`) di atas; termahal Geralt (`Rp 200.000`) di atas; default unggulan menampilkan Sailor Moon, Naruto, Luffy berurutan A–Z; counter berubah sesuai filter.
  - **File:** `src/ui/catalog.js`, `src/state.js`

- [x] **T3.5 — Empty state + tombol Hapus Filter**
  - **Deskripsi:** Jika hasil 0, ganti grid dengan panel `UI-SPEC.md` 3.4/5.1: ikon TV static, `TIDAK ADA KOSTUM YANG COCOK.`, tombol merah outline `HAPUS FILTER`.
  - **AC (manual browser):** **B10** lolos: cari `zzzz` → empty state muncul; klik `HAPUS FILTER` → query & semua filter kembali default, 8 kartu tampil, counter `8 HASIL`; Console tidak error.
  - **File:** `src/ui/catalog.js`, `src/ui/components.js`, `src/styles.css`

---

## Milestone 4 — Modal Detail, Kalkulator Sewa & Integrasi WhatsApp (~65 menit)

**Tujuan:** Inti nilai aplikasi: estimasi biaya otomatis dan pesan WhatsApp siap kirim.
**Gate masuk:** AC B1–B10 lolos.
**Gate keluar:** AC C1–C8 dan D1–D4 lolos (D4 boleh in-memory).

> **Catatan implementasi (M4):**
> 1. Sesuai konfirmasi, rumus memakai **`SPEC.md` 4.4**, bukan contoh `ceil(durasi/2) × harga` pada instruksi: `total = hargaPer2Hari + (durasi−2) × ceil(hargaPer2Hari/2)`. Jadi 5 hari @ Rp100.000 = **Rp250.000** (AC C5/C6 tetap lolos); rumus alternatif akan memberi Rp300.000.
> 2. Durasi menyediakan **keduanya**: stepper + input angka 2–30 (step 1, sehingga 5 hari bisa diuji) **dan** pintasan chip kelipatan 2 hari (2/4/6/8/10).
> 3. Helper murni (`calculateRentalTotal`, `getRentalBreakdown`, `buildWhatsAppMessage`, `buildWhatsAppUrl`, validasi nomor) ditempatkan di `src/products.js`; modal dibangun di `src/ui.js`; simulasi sewa memakai `updateProduct()` di `src/store.js` (tanpa modul `utils.js` / `src/ui/detailModal.js` baru).
> 4. AC C/D dijalankan dengan nama seed fiktif M2 (mis. `Luna Silver` menggantikan `Sailor Moon`). Nomor `6281234567890` tetap placeholder. Tidak ada payment gateway / API WA.

- [x] **T4.1 — Modal detail + 3 cara tutup + focus management**
  - **Deskripsi:** Bangun modal per `UI-SPEC.md` 4.2/5.2: header kuning, gambar, metadata, panel `KELENGKAPAN KOSTUM`, tombol ✕; tutup via ✕ / overlay / `Esc`; fokus masuk ke modal dan kembali ke kartu pemicu.
  - **AC (manual browser):** **C1, C2** lolos: klik kartu → deskripsi "Lengkap: wig blonde, mahkota…" tampil; ✕, klik luar, dan `Esc` semuanya menutup; setelah tutup fokus kembali ke tombol kartu yang diklik.
  - **File:** `src/ui/detailModal.js` (baru), `src/ui/components.js`, `src/main.js`, `src/styles.css`

- [x] **T4.2 — Input tanggal mulai & durasi dengan clamp**
  - **Deskripsi:** `<input type="date">` dengan `min` = hari ini dan default hari ini; stepper `− / angka / +` dengan `clamp(2, 30)` sesuai `SPEC.md` 4.4.
  - **AC (manual browser):** **C3, C4** lolos: tanggal kemarin tidak bisa dipilih; durasi default 2; mengisi `0` atau `1` → langsung menjadi `2`; mengisi `31` → menjadi `30`; tombol `+` di 30 tidak menambah.
  - **File:** `src/ui/detailModal.js`, `src/utils.js`

- [x] **T4.3 — Kalkulator otomatis + rincian + total mencolok**
  - **Deskripsi:** Terapkan `hitungSewa()` (`hargaHariTambahan = ceil(harga/2)`); tampilkan baris paket 2 hari, baris tambahan (tetap tampil `Rp 0` saat 0 hari), dan strip total kuning; formatter Rupiah `id-ID`.
  - **AC (manual browser):** **C5, C6, C7** lolos: Sailor Moon 2 hari → **Rp 100.000**; ubah ke 5 hari → **Rp 250.000** (3 × Rp 50.000) tanpa tombol hitung; ganti tanggal → nominal tidak berubah.
  - **File:** `src/utils.js`, `src/ui/detailModal.js`, `src/styles.css`

- [x] **T4.4 — Generator pesan & tautan `wa.me` pre-filled**
  - **Deskripsi:** Susun pesan persis `SPEC.md` 4.5 (nama, asal, ukuran, tanggal `YYYY-MM-DD`, durasi + rincian hari, estimasi); URL = `https://wa.me/6281234567890?text=${encodeURIComponent(pesan)}`, buka di tab baru dengan `rel="noopener noreferrer"`.
  - **AC (manual browser):** **D1, D2** lolos: klik `SEWA VIA WHATSAPP` → tab baru ke `wa.me/6281234567890`; pesan berisi 6 informasi dan `Rp 250.000`; spasi/newline ter-encode rapi (tidak rusak); tombol WA hijau dengan **teks hitam**.
  - **File:** `src/utils.js`, `src/ui/detailModal.js`, `src/data/seed.js`

- [x] **T4.5 — Nonaktifkan WA saat kostum tidak tersedia**
  - **Deskripsi:** Terapkan `F2.8`: tombol disabled jika `status !== 'Tersedia'` **atau** `stok === 0`; ganti ikon peringatan dan tampilkan alasan merah `KOSTUM TIDAK TERSEDIA UNTUK DISEWA.`
  - **AC (manual browser):** **C8** lolos: modal Luffy (Disewa), Samus (Perawatan), dan kostum stok 0 → tombol abu, tidak bisa diklik, alasan merah muncul; Sailor Moon tetap aktif.
  - **File:** `src/ui/detailModal.js`, `src/ui/components.js`

- [x] **T4.6 — Checkbox simulasi sewa (stok & status)**
  - **Deskripsi:** Checkbox `TANDAI SEBAGAI DISEWA (SIMULASI)`; saat klik WA dan dicentang, jalankan jalur ke-2 `SPEC.md` 4.4 (stok > 1 → stok−1; stok === 1 → stok 0 + status `Sedang Disewa`); toast sukses.
  - **AC (manual browser):** **D4** lolos: Sailor Moon stok 3 → 2, status tetap Tersedia; ulangi sampai 0 → status berubah `DISEWA`, badge kartu & tombol WA ikut berubah; di M6 perubahan ini akan persisten.
  - **File:** `src/ui/detailModal.js`, `src/state.js`, `src/ui/components.js`

---

## Milestone 5 — Dashboard Demo Pengelola (CRUD) (~75 menit)

**Tujuan:** Pengelola bisa menambah, edit, mengubah status, dan menghapus kostum.
**Gate masuk:** AC C & D lolos.
**Gate keluar:** AC E1–E7 lolos secara in-memory (poin "setelah refresh" menyusul di M6).

- [ ] **T5.1 — Daftar manajemen kostum (tabel + card-list)**
  - **Deskripsi:** Render tabel per `UI-SPEC.md` 4.3 (header hitam-teks kuning, zebra, kolom KOSTUM/KATEGORI/UKURAN/HARGA/STOK/STATUS/AKSI) dan card-list di `< lg`.
  - **AC (manual browser):** 8 baris tampil dengan harga `RP … / 2 HARI`; di 1280px tabel rapi; di 375px berubah menjadi 8 kartu dengan tombol `EDIT` / `HAPUS`; tidak ada horizontal scroll di luar wrapper tabel.
  - **File:** `src/ui/dashboard.js`, `src/styles.css`

- [ ] **T5.2 — Modal form Tambah & Edit kostum**
  - **Deskripsi:** Modal 2 kolom di `≥ md` dengan 10 field data model; `id` tidak ditampilkan; Tambah → `crypto.randomUUID()` (fallback di `utils.js`), `unggulan` default false; Edit → terisi data lama dan id immutable.
  - **AC (manual browser):** Klik `+ TAMBAH KOSTUM` → form kosong, pilihan kategori/ukuran/status sesuai enum; klik `EDIT` pada Naruto → field terisi `Naruto Uzumaki`, `125000`; tombol `BATAL` menutup tanpa perubahan.
  - **File:** `src/ui/dashboard.js`, `src/ui/components.js`, `src/utils.js`

- [ ] **T5.3 — Validasi form inline**
  - **Deskripsi:** Terapkan aturan `SPEC.md` 4.2: trim + panjang teks, enum, angka bulat `>= 0`, `imageUrl` kosong → placeholder; error merah per field + fokus ke field pertama error; gagal → jangan tulis state.
  - **AC (manual browser):** **E3** lolos: harga negatif / stok `2.5` / nama 2 karakter ditolak, pesan error muncul tepat di bawah field terkait, fokus berpindah ke field itu, jumlah kartu tetap 8.
  - **File:** `src/ui/dashboard.js`, `src/utils.js`

- [ ] **T5.4 — Ubah status cepat**
  - **Deskripsi:** `<select>` status di tiap baris/kartu; perubahan langsung update state & render ulang katalog + statistik; **stok tidak diubah otomatis** pada jalur manual (aturan 4.3 jalur 1).
  - **AC (manual browser):** **E5** lolos: ubah Samus `Perawatan → Tersedia` → badge katalog jadi emerald, angka unit tersedia tetap **17** (stok 0); ubah Naruto ke `Sedang Disewa` → angka "Sedang Disewa" jadi 2 dan unit tersedia turun 2.
  - **File:** `src/ui/dashboard.js`, `src/state.js`, `src/main.js`

- [ ] **T5.5 — Hapus kostum dengan konfirmasi**
  - **Deskripsi:** Tombol `HAPUS` → `window.confirm('HAPUS KOSTUM INI? TINDAKAN INI TIDAK DAPAT DIBATALKAN.')`; Batal = no-op, OK = hapus dari state + render ulang.
  - **AC (manual browser):** **E6** lolos: klik Hapus → dialog muncul; pilih **Batal** → 8 kartu tetap; ulangi pilih **OK** → kostum hilang, total katalog jadi 7, statistik berkurang.
  - **File:** `src/ui/dashboard.js`, `src/state.js`

- [ ] **T5.6 — Tombol `RESET DATA DUMMY` + konfirmasi**
  - **Deskripsi:** Tombol hitam-teks kuning dengan stripe merah; klik → `window.confirm`; OK → timpa state dengan 8 seed persis tabel 4.6, render ulang katalog + dashboard.
  - **AC (manual browser):** **E7 (tanpa refresh)** lolos: setelah hapus/edit, klik Reset → OK → tepat 8 kostum dengan Sailor Moon stok 3 Tersedia, Luffy Disewa, Samus Perawatan; angka kembali 8 / 17 / 1.
  - **File:** `src/ui/dashboard.js`, `src/data/seed.js`, `src/state.js`

---

## Milestone 6 — Persistensi localStorage & Reset Data (~40 menit)

**Tujuan:** Semua mutasi bertahan setelah refresh; data rusak otomatis pulih.
**Gate masuk:** CRUD berfungsi in-memory.
**Gate keluar:** Refresh berkali-kali tidak mengubah data; AC E2/E4/E7 penuh & F4 lolos.

- [ ] **T6.1 — Modul `storage.js` (load/save/reset)**
  - **Deskripsi:** Buat `loadKostum()`, `saveKostum(arr)`, `resetKostum()` dengan key `costestant.kostum.v1`; baca/tulis selalu di `try/catch`.
  - **AC (manual browser):** DevTools → Application → Local Storage → `costestant.kostum.v1` muncul setelah pertama buka; isinya array JSON berisi 8 objek dengan field lengkap sesuai `SPEC.md` 4.1.
  - **File:** `src/storage.js` (baru), `src/main.js`

- [ ] **T6.2 — Inisialisasi awal & auto-reseed data rusak**
  - **Deskripsi:** Saat load: key belum ada / JSON invalid / bukan array / array kosong → tulis seed; valid → pakai data tersebut.
  - **AC (manual browser):** Ubah nilai key di DevTools menjadi `bukan-json`, lalu hard refresh → katalog kembali 8 kartu, Console **tidak ada error**, key otomatis berisi seed lagi.
  - **File:** `src/storage.js`, `src/data/seed.js`, `src/main.js`

- [ ] **T6.3 — Sinkronisasi semua mutasi ke localStorage**
  - **Deskripsi:** Tambah/edit/hapus/ubah status/simulasi sewa/reset memanggil `saveKostum()` lalu render ulang; satu fungsi `commit()` di state dipakai semua modul agar tidak ada yang terlewat.
  - **AC (manual browser):** **E2 penuh, E4 penuh, E7 penuh** lolos: tambah kostum → 9 kartu, refresh → tetap 9; edit harga Naruto → 150000, refresh → tetap; reset → 8 seed, refresh → tetap 8; simulasi sewa Sailor Moon stok 3→2, refresh → tetap 2.
  - **File:** `src/state.js`, `src/storage.js`, `src/main.js`, `src/ui/dashboard.js`, `src/ui/detailModal.js`

- [ ] **T6.4 — Meta key & fallback localStorage gagal**
  - **Deskripsi:** Tulis `costestant.meta.v1 = { version: 1, lastReset: <ISO> }`; jika akses storage gagal (private mode / kuota penuh), tetap pakai data in-memory dan munculkan toast peringatan kuning.
  - **AC (manual browser):** **F4** lolos: buka di mode privat / blokir storage → aplikasi tidak crash, toast `PENYIMPANAN LOKAL TIDAK TERSEDIA; PERUBAHAN HANYA SESI INI.` muncul, CRUD masih bisa dipakai selama sesi; Console bersih.
  - **File:** `src/storage.js`, `src/ui/components.js`, `src/main.js`

- [ ] **T6.5 — Statistik & stock chip dari data tersimpan**
  - **Deskripsi:** Pastikan 3 kartu statistik dan chip navbar dihitung ulang dari state hasil load storage, bukan dari seed statis.
  - **AC (manual browser):** **E1 penuh** lolos: setelah ubah status Samus → Tersedia lalu refresh, chip navbar & kartu statistik tetap konsisten dengan data tersimpan; pada seed murni kembali menampilkan **8 / 17 / 1**.
  - **File:** `src/ui/dashboard.js`, `src/ui/layout.js`, `src/main.js`

---

## Milestone 7 — Testing Manual & Responsivitas (~60 menit)

**Tujuan:** UAT menyeluruh terhadap `SPEC.md` Bagian 8 dan `UI-SPEC.md` Bagian 6.
**Gate masuk:** M1–M6 selesai.
**Gate keluar:** Seluruh checklist A1–F5 ✅ dan tidak ada temuan blocker.

- [ ] **T7.1 — UAT alur penyewa (A–D)**
  - **Deskripsi:** Jalankan berurutan AC A1–A4, B1–B10, C1–C8, D1–D4 di browser desktop; catat ✅/❌ langsung di `SPEC.md` Bagian 8.
  - **AC (manual browser):** 4+10+8+4 = 26 poin penyewa semuanya ✅; terkhusus D2 pesan WA memuat 6 informasi dan D4 stok/status berubah sesuai simulasi.
  - **File:** `SPEC.md` (centang AC), `TASKS.md`, perbaikan di `src/ui/catalog.js` / `src/ui/detailModal.js` bila ada

- [ ] **T7.2 — UAT alur pengelola (E1–E7)**
  - **Deskripsi:** Uji tambah, validasi gagal, edit, ubah status cepat, hapus (Batal & OK), reset — masing-masing diikuti hard refresh.
  - **AC (manual browser):** 7 poin E ✅; angka 8 / 17 / 1 kembali persis setelah Reset + refresh; tidak ada data hantu di Local Storage.
  - **File:** `SPEC.md` (centang AC), `src/ui/dashboard.js`, `src/storage.js`

- [ ] **T7.3 — Cek breakpoint 375 / 768 / 1024 / 1280 px**
  - **Deskripsi:** Pakai DevTools device toolbar; verifikasi grid 1/2/3/4 kolom, sticky navbar, sticky filter hanya di `≥ lg`, card-list dashboard di mobile.
  - **AC (manual browser):** **F1, F2** lolos: di 375px tidak ada horizontal scroll di halaman utama & modal masih bisa ditutup; di 1280px kartu 4 kolom dan tabel dashboard rapi; tombol sentuh ≥ 44px.
  - **File:** `src/styles.css`, `tailwind.config.js`, `src/ui/catalog.js`, `src/ui/dashboard.js`

- [ ] **T7.4 — Cek interaksi & aksesibilitas keyboard**
  - **Deskripsi:** Uji Tab/Shift+Tab, `focus-visible` merah, `Esc` modal, fokus kembali ke pemicu, atribut `alt`, label input, dan tombol disabled.
  - **AC (manual browser):** **C2 + NFR6** lolos: ring merah `#E60012` terlihat di semua elemen; `Esc` menutup modal; tombol `DISEWA` tidak merespons klik; pembaca layar menyebut teks badge/status.
  - **File:** `src/ui/detailModal.js`, `src/ui/dashboard.js`, `src/styles.css`

- [ ] **T7.5 — Verifikasi kontras & konsistensi visual**
  - **Deskripsi:** Cocokkan hasil render dengan `UI-SPEC.md` Bagian 1.1 dan Checklist Bagian 6; cek kuning→hitam, emerald→hitam, merah→putih, border 3px, shadow tanpa blur, skew badge.
  - **AC (manual browser):** Tidak ada teks putih di atas kuning/emerald; badge status selalu punya teks; warna badge identik di kartu/modal/dashboard; tombol WA tetap hitam di atas `#10B981`.
  - **File:** `tailwind.config.js`, `src/styles.css`, `src/ui/components.js`

- [ ] **T7.6 — Console bersih & fallback gambar**
  - **Deskripsi:** Jalankan seluruh alur A–E sambil membuka Console; hapus sementara salah satu SVG untuk menguji `onerror`; uji render 50 kartu dengan menggandakan seed di memori.
  - **AC (manual browser):** **F3 + NFR2/NFR5** lolos: tidak ada error/warning; gambar yang hilang otomatis diganti `placeholder.svg`; 50 kartu tampil responsif tanpa lag terasa.
  - **File:** `src/main.js`, `src/ui/catalog.js`, `public/images/placeholder.svg`

---

## Milestone 8 — Security & Sanitasi Input (~30 menit)

**Tujuan:** Hardening pasca-UAT: tidak ada XSS, angka tervalidasi, tidak ada kredensial.
**Gate masuk:** T7.1–T7.6 ✅.
**Gate keluar:** F5, E3 (batas atas), D3 lolos.

- [ ] **T8.1 — Audit render teks bebas (anti-XSS)**
  - **Deskripsi:** Pastikan semua `nama`, `asal`, `deskripsi`, dan pesan status dirender dengan `textContent` / `escapeHtml()`; dilarang `innerHTML` untuk data user.
  - **AC (manual browser):** **F5** lolos: tambah kostum dengan nama `<img src=x onerror=alert(1)>` → teks tampil apa adanya sebagai string, tidak muncul dialog `alert`, tidak ada gambar asing; hapus kostum uji tersebut.
  - **File:** `src/ui/catalog.js`, `src/ui/detailModal.js`, `src/ui/dashboard.js`, `src/utils.js`

- [ ] **T8.2 — Validasi numerik harga & stok (batas atas)**
  - **Deskripsi:** Perketat `utils.js`: `hargaPer2Hari` bulat `0…100000000`; `stok` bulat `0…999`; tolak `NaN`, `Infinity`, dan string desimal.
  - **AC (manual browser):** **E3 (lanjutan)** lolos: harga `100000001` dan stok `1000` ditolak dengan error inline; harga `0` dan stok `0` diterima; kalkulator harga 0 menampilkan `Rp 0` tanpa `NaN`.
  - **File:** `src/utils.js`, `src/ui/dashboard.js`

- [ ] **T8.3 — Enum & batas panjang teks**
  - **Deskripsi:** Pastikan select hanya menghasilkan nilai enum persis (`Anime|Game|Tokusatsu|Original`, `S|M|L|XL|All Size`, 3 status) dan panjang nama 3–80, asal 2–80, deskripsi 10–500 setelah trim.
  - **AC (manual browser):** Form menolak nama 2 karakter, asal 1 karakter, deskripsi 8 karakter; tidak ada opsi kategori/`ukuran` di luar daftar; seed tetap 8 data valid.
  - **File:** `src/data/seed.js`, `src/ui/dashboard.js`, `src/utils.js`

- [ ] **T8.4 — Audit kredensial & nomor placeholder**
  - **Deskripsi:** Cari seluruh teks proyek untuk `apiKey`, `token`, `password`, pola nomor `08…`/`+62…`; pastikan satu-satunya nomor adalah konstanta `WHATSAPP_NUMBER = '6281234567890'` dan label footer demo.
  - **AC (manual browser):** **D3** lolos: hasil pencarian tidak menemukan API key/token/nomor pribadi; pesan WA masih mengarah ke `6281234567890`; tidak ada field password/login di UI.
  - **File:** `src/data/seed.js`, `index.html`, `.gitignore`, `README.md` (opsional)

---

## Milestone 9 — Production Build (~25 menit)

**Tujuan:** Bundle produksi bisa dijalankan dan bebas error.
**Gate masuk:** M8 selesai.
**Gate keluar:** `npm run build` + `npm run preview` sukses, alur inti jalan di bundle.

- [ ] **T9.1 — Konfigurasi build Vite**
  - **Deskripsi:** Pastikan `vite.config.js` dan script `build` sudah benar; tidak ada plugin yang tidak terpakai; tentukan `base` awal `'/'`.
  - **AC (manual browser):** `npm run build` selesai tanpa error merah; folder `dist/` terbentuk berisi `index.html`, `assets/`, dan `images/`.
  - **File:** `vite.config.js`, `package.json`, `dist/` (generated)

- [ ] **T9.2 — Smoke test via `npm run preview`**
  - **Deskripsi:** Jalankan preview produksi dan ulangi alur katalog → filter → modal → WA → CRUD → reset.
  - **AC (manual browser):** Semua alur di atas bekerja di URL preview; Console bersih; tidak ada request 404 ke `/images/kostum-0X.svg` maupun `/images/placeholder.svg`.
  - **File:** `index.html`, `public/images/*`, `src/main.js`

- [ ] **T9.3 — Optimasi aset lokal**
  - **Deskripsi:** Cek ukuran 9 SVG, hapus metadata/comment tidak perlu, pastikan `loading="lazy"` pada kartu di bawah lipatan dan `onerror` fallback aktif di build produksi.
  - **AC (manual browser):** Total aset SVG < 100 KB; semua gambar tampil di preview; saat salah satu SVG diganti nama sementara, fallback muncul tanpa error Console.
  - **File:** `public/images/kostum-01.svg` … `public/images/kostum-08.svg`, `public/images/placeholder.svg`, `src/ui/catalog.js`

- [ ] **T9.4 — Cek ukuran bundle & determinisme build**
  - **Deskripsi:** Catat ukuran bundle JS/CSS (target `< ~100 KB` gzip untuk prototype ini); jalankan build dua kali dan bandingkan nama file.
  - **AC (manual browser):** Terminal build menampilkan ukuran; build kedua menghasilkan nama aset identik; tidak ada source map atau komentar yang membocorkan path lokal/rahasia.
  - **File:** `vite.config.js`, `dist/` (generated), `README.md` (opsional)

---

## Milestone 10 — Deployment (~25 menit)

**Tujuan:** Aplikasi statis bisa dipublish ke Vercel / Netlify / GitHub Pages dengan panduan jelas.
**Gate masuk:** M9 lolos.
**Gate keluar:** URL publik bisa dibuka dan alur inti berjalan; `DEPLOY.md` tersedia.

- [ ] **T10.1 — Siapkan konfigurasi sesuai target**
  - **Deskripsi:** Pilih satu target utama (Vercel/Netlify/GH Pages); untuk GH Pages set `base: '/costestant/'` di `vite.config.js`; untuk Vercel/Netlify cukup default `dist/`.
  - **AC (manual browser):** Build dengan konfigurasi terpilih sukses; saat dibuka lewat `preview`, path gambar tetap benar (tidak 404 karena salah `base`).
  - **File:** `vite.config.js`, `vercel.json` (opsional), `netlify.toml` (opsional), `public/_redirects` (opsional)

- [ ] **T10.2 — Tulis panduan deploy**
  - **Deskripsi:** Buat `DEPLOY.md` berisi perintah `npm install`, `npm run build`, langkah untuk 3 target, dan peringatan **nomor WA masih placeholder, ganti sebelum produksi**.
  - **AC (manual browser):** Panduan bisa diikuti orang lain tanpa bertanya; tercantum folder output `dist/`; tidak ada langkah yang meminta API key/token.
  - **File:** `DEPLOY.md` (baru), `README.md` (opsional)

- [ ] **T10.3 — Deploy statis & smoke test URL publik**
  - **Deskripsi:** Upload/push ke target, lalu buka URL publik di browser bersih (tanpa storage lama).
  - **AC (manual browser):** 8 kartu tampil di URL publik; pencarian, kalkulator, tautan WA, CRUD, dan reset berfungsi; Console bersih; dengan `base` GH Pages gambar tetap tampil.
  - **File:** `DEPLOY.md`, (dashboards hosting — bukan file lokal)

- [ ] **T10.4 — Finalisasi & handoff**
  - **Deskripsi:** Centang seluruh milestone di `TASKS.md`; pastikan tidak ada file debug/`console.log` sementara; konfirmasi ruang lingkup masih sesuai `SPEC.md` Bagian 7.
  - **AC (manual browser):** Semua 10 milestone berstatus ✅; tidak ada fitur login/backend/payment; nomor WA masih `6281234567890`; dokumen `SPEC.md`, `UI-SPEC.md`, `TASKS.md`, `DEPLOY.md` tersedia dan konsisten.
  - **File:** `TASKS.md`, `SPEC.md`, `UI-SPEC.md`, `DEPLOY.md`, `README.md` (opsional)

---

## Ringkasan Gate Keluar Akhir

- [ ] Semua AC `SPEC.md` A1–F5 berstatus ✅.
- [ ] Visual sesuai `UI-SPEC.md` (kuning→hitam, border 3px, shadow keras, badge miring, scanline).
- [ ] Data persisten di `localStorage` dengan reset ke 8 seed.
- [ ] Tidak ada kredensial, nomor pribadi, backend, login, atau fitur out-of-scope.
- [ ] Build produksi & URL publik bebas error.

> Jika ada konflik saat eksekusi: **perilaku mengikuti `SPEC.md`, tampilan mengikuti `UI-SPEC.md`**, dan urutan kerja mengikuti `TASKS.md`. Catat revisi di header dokumen yang bersangkutan.
