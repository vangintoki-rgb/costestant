# UI-SPEC.md — Costestant (Persona 4 Golden–Inspired)

> Dokumen panduan visual & interaksi untuk **Costestant**.
> Pendamping wajib dari `SPEC.md` (logika, data, dan acceptance criteria tetap mengacu ke sana).
> Versi: `1.0` — Target: prototyping 1 hari — **Belum ada kode aplikasi pada tahap ini.**

---

## 0. Prinsip Penerjemahan Gaya (Penting Sebelum Coding)

Gaya yang dipakai adalah **"pop-art neo-brutalist dengan rooftop-TV energy"**: kuning menyala, hitam pekat, garis tebal, bayangan keras, dan label miring. Ini terinspirasi dari antarmuka *Persona 4 Golden* (**referensi gaya visual saja**).

**Batasan IP:** Jangan memakai logo, nama karakter, font resmi, ilustrasi, atau aset berhak cipta dari game tersebut. Semua teks UI harus **original** (contoh tagline di bawah). Elemen khas yang boleh ditiru adalah: *yellow-on-black typography, skewed badge, hard border/shadow, TV scanline, sudut tajam*.

**Hubungan dengan `SPEC.md`:**

| UI-SPEC ini mengatur | `SPEC.md` tetap mengatur |
|---|---|
| Warna, font, border, shadow, ikon, state hover/disabled | Rumus sewa (4.4), data model (4.1), validasi (4.2) |
| Layout, wireframe, nonempty/empty visual | Pencarian → filter → sort pipeline (4.7/R11) |
| Penampilan badge status & tombol WA | Nomor placeholder `6281234567890`, format pesan (4.5) |
| Responsivitas visual (NFR1) | Statistik 8 / 17 / 1 (4.3) |

---

## 1. Sistem Desain (Design System)

### 1.1 Palet Warna & Aturan Kontras

| Token | Hex | Peran Utama | Aturan Kontras (WCAG AA) |
|---|---|---|---|
| `color-yellow` | `#FFE600` | Persona Yellow — latar hero, badge aktif, ribbon harga, sorotan | **Wajib teks `#111111`** (~14.9:1). ❌ Dilarang teks putih di atas kuning ini (~1.4:1, gagal AA). |
| `color-yellow-soft` | `#FACC15` | Variasi kuning untuk hover/aksen sekunder | **Wajib teks `#111111`** (~12.3:1). ❌ Putih di atasnya ~1.5:1. |
| `color-ink` | `#111111` | Hitam pekat — teks utama, border 2–3px, header tabel, overlay | Dasar kontras. Di atas putih ≈ 18.9:1; di atas kuning ≈ 14.9:1. ✅ |
| `color-paper` | `#FFFFFF` | Putih bersih — kartu, panel, modal, input | Pasangkan dengan `color-ink`. ✅ |
| `color-static` | `#F3F4F6` | Abu TV Static — latar sekunder, panel kalkulator, baris zebra | Teks `#111111` ≈ 17:1. ✅ |
| `color-alert` | `#E60012` | Merah terang — status "Sedang Disewa", error, stok habis, focus ring | Teks **putih** di atas merah ≈ 4.8:1 ✅. Teks hitam di atas merah ≈ 3.9:1 ❌ untuk teks biasa. |
| `color-emerald` | `#10B981` | Hijau — status "Tersedia", tombol WhatsApp | Teks **hitam** di atas emerald ≈ 7.4:1 ✅. ❌ Putih di atas emerald ≈ 2.5:1. |
| `color-emerald-deep` | `#047857` | Hijau gelap — **hanya** jika teks putih dipaksa pada tombol hijau | Putih ≈ 5.5:1 ✅. |
| `color-muted` | `#4B5563` | Teks pendukung (stok, keterangan) | Di atas `#F3F4F6` ≈ 7:1 ✅; di atas putih ≈ 7.5:1 ✅. |
| `color-line` | `#D1D5DB` | Garis tipis internal (pembagi tabel) | Bukan untuk teks; selalu dampingi border hitam tebal. |

**Aturan kontras ringkas (hafalan saat coding):**
1. Kuning → **selalu** hitam.
2. Emerald `#10B981` → **selalu** hitam. Kalau ingin putih, ganti ke `#047857`.
3. Merah `#E60012` → **selalu** putih.
4. Hitam/putih adalah pasangan default untuk semua panel dan tombol netral.
5. Jangan pernah mengandalkan warna saja: badge status tetap disertai **teks** (`TERSEDIA`, `DISEWA`, `PERAWATAN`, `STOK HABIS`) dan/atau ikon.

**Contoh kombinasi yang benar:**

| Elemen | Latar | Teks | Rasio |
|---|---|---|---|
| Ribbon harga | `#FFE600` | `#111111` | ~14.9:1 ✅ |
| Badge "Sedang Disewa" | `#E60012` | `#FFFFFF` | ~4.8:1 ✅ |
| Badge "Tersedia" | `#10B981` | `#111111` | ~7.4:1 ✅ |
| Tombol WhatsApp | `#10B981` | `#111111` | ~7.4:1 ✅ |
| Header tabel | `#111111` | `#FFE600` | ~14.9:1 ✅ |
| Tombol Hapus | `#FFFFFF` | `#E60012` | ~4.8:1 ✅ |
| Hero CTA | `#111111` | `#FFE600` | ~14.9:1 ✅ |

### 1.2 Tipografi

| Token | Font | Weight | Ukuran (desktop / mobile) | Use |
|---|---|---|---|---|
| `font-display` | Poppins → Montserrat → Plus Jakarta Sans → sans-serif | 800 | 32–48 / 26–32px | Hero headline, judul modal, angka statistik |
| `font-heading` | Poppins (stack sama) | 700 | 18–24 / 16–20px | Nama kostum, judul bagian, label nav |
| `font-label` | Poppins | 700 | 11–13px | Badge, tag, tombol, label form — **UPPERCASE**, `letter-spacing: .06em` |
| `font-body` | Poppins | 400/500 | 14–15px | Deskripsi & rincian — **sentence case** (lebih mudah dibaca untuk teks panjang) |
| `font-number` | Poppins | 800 | 20–32px | Harga & total, `font-variant-numeric: tabular-nums` |

**Aturan huruf kapital:** Semua label pendek (nav, badge, tombol, header tabel, label form, tag) **WAJIB UPPERCASE**. Deskripsi kostum dan pesan bantuan boleh sentence case demi keterbacaan.

**Skew khas:** Badge kategori, ribbon harga, dan logo memakai `transform: skewX(-6deg)`. Teks di dalamnya diberi `skewX(6deg)` agar tetap tegak. Jangan menerapkan skew pada input, paragraf, atau tombol aksi utama (ganggu keterbacaan).

### 1.3 Border, Radius & Hard Shadow

| Token | Nilai | Keterangan |
|---|---|---|
| `border-thin` | `2px solid #111111` | Pembagi internal, input, chip tidak aktif |
| `border-hard` | `3px solid #111111` | **Default** untuk kartu, panel, tombol, modal, navbar |
| `shadow-hard` | `4px 4px 0 #111111` | Bayangan keras tanpa blur (wajib di kartu & tombol) |
| `shadow-hard-lg` | `6px 6px 0 #111111` | State hover kartu / modal |
| `shadow-press` | `2px 2px 0 #111111` | State active (ditekan) |
| `shadow-yellow` | `4px 4px 0 #FFE600` | Khusus hero CTA di atas latar hitam |
| `radius` | `0px` (default), `4px` (input & modal), `999px` (hanya dot indikator) | Sudut tajam = identitas visual; jangan pakai `rounded-xl` |
| `focus-ring` | `outline: 3px solid #E60012; outline-offset: 2px` | Semua elemen interaktif saat `:focus-visible` |

**Dilarang:** `box-shadow` dengan blur (mis. `0 4px 12px rgba(...)`), gradient lembut pada kartu, transisi > 200ms.

### 1.4 Efek TV Scanline & Midnight-Channel Stripe

Dipakai **hanya** di hero dan overlay modal, sebagai dekorasi non-interaktif:

- `pointer-events: none`, `opacity` rendah (~0.10–0.14), tidak mengganggu kontras teks.
- Scanline horizontal: garis 1px `#111111` transparan tiap 4px (ubah `repeating-linear-gradient`).
- Diagonal stripe 135°: blok 8px transparan / 8px `#111111` @5%, dipakai di pinggir hero dan stamp "DISEWA".
- Opsional "static noise": pola titik 2px via radial-gradient halus di pojok kanan hero.
- `prefers-reduced-motion: reduce` → matikan animasi scanline bergerak (jika ada), teks tetap tampil.

### 1.5 Aturan Ikon & Badge

| Elemen | Bentuk | Warna | Catatan |
|---|---|---|---|
| Logo | Badge miring `-6deg`, border 3px, shadow 4px | Kuning `#FFE600` + teks hitam | Tulisan `COSTESTANT`, weight 800 |
| Ikon pencarian | Inline SVG, lingkaran + gagang, stroke 2.5px | `currentColor` | 20px; tombol search latar hitam, ikon kuning |
| Bintang unggulan | SVG star isi, 16px | `#E60012` dengan outline hitam 1px | Hanya jika `unggulan === true` (F1.8) |
| Ikon WhatsApp | SVG telepon dalam gelembung, stroke 2.5px | `currentColor` (hitam di atas emerald) | 20px, di kiri teks tombol |
| Ikon peringatan | Segitiga `!`, stroke 2.5px | `#FFFFFF` di atas `#E60012` | Dipakai saat status bukan Tersedia / error validasi |
| Ikon tanggal | Kalender SVG 18px | `currentColor` | Di dalam input tanggal |
| Badge status | Label kotak miring `-4deg`, border 2px hitam, tinggi ~24px | Tersedia: emerald+hitam; Disewa: merah+putih; Perawatan: static+hitam | Selalu disertai teks UPPERCASE |
| Badge asal series | Label miring di pojok kiri atas gambar | Kuning + teks hitam | Contoh: `Sailor Moon` |
| Tag ukuran | Kotak kecil hitam, teks putih | `#111111` + `#FFFFFF` | Pojok kanan bawah gambar |

Semua ikon: **inline SVG**, `width/height` eksplisit, `stroke="currentColor"`, `stroke-width="2.5"`, `fill="none"` kecuali bintang. Jangan memakai emoji sebagai ikon final (boleh sebagai fallback sementara).

### 1.6 Spacing, Layout & Z-Index

| Token | Nilai |
|---|---|
| `space-1` … `space-12` | 4, 8, 12, 16, 24, 32, 48, 64px |
| Container | `max-width: 1280px`, padding 16px (mobile) / 24px (tablet) / 32px (desktop), margin auto |
| Grid gap | 16px mobile, 20px tablet, 24px desktop |
| Navbar height | 56px mobile (+ 48px tab bar), 64px desktop |
| Hero padding | 32px 16px mobile / 56px 32px desktop |
| Radius kartu | 0px |

**Z-index:** navbar `30` · filter sticky `20` · overlay modal `50` · modal `51` · toast notifikasi `60`.

### 1.7 Motion

- Transisi standar: `120ms ease-out` untuk transform & box-shadow.
- Hover kartu: `translate(-2px, -2px)` + shadow `6px 6px`.
- Active/ditekan: `translate(2px, 2px)` + shadow `2px 2px`.
- Modal masuk: `opacity 0→1` + `translateY(8px→0)`, 150ms.
- `prefers-reduced-motion`: semua transisi jadi `0ms`.

---

## 2. Spesifikasi Layout Responsif (Mobile-First)

| Breakpoint | Lebar | Kolom Grid Kostum | Perilaku Kunci |
|---|---|---|---|
| Base (mobile) | `< 640px` | **1** | Navbar + bar tab 2 tombol; hero penuh; filter jadi 2 baris wrap; kartu lebar penuh; modal ≈ layar penuh dengan margin 12px; statistik stack 1 kolom; tabel jadi kartu (card-list) |
| `sm` | `≥ 640px` | **2** | Navbar desktop-style mulai muncul; filter chips sebaris; statistik 3 kolom; tabel masih bisa card-list sampai `md` |
| `md` | `≥ 768px` | **2** | Modal 2 kolom (gambar | info); form CRUD 2 kolom |
| `lg` | `≥ 1024px` | **3** | Navbar lengkap + stock chip; filter sticky di bawah navbar; tabel manajemen penuh |
| `xl` | `≥ 1280px` | **4** | Container 1280px; hero headline 48px; card image 4:5 lebih lega |

**Aturan umum:**
- Tidak boleh ada horizontal scroll di halaman utama (NFR1). Pengecualian: wrapper tabel dashboard di `lg` boleh `overflow-x: auto` dengan scrollbar hitam 6px.
- Ukuran sentuhan minimum 44×44px untuk semua tombol di mobile.
- Filter sticky hanya aktif di `≥ lg` (`top: 64px`); di mobile ikut scroll agar hemat ruang.

---

## 3. Spesifikasi Per Komponen & State Interaktif

### 3.1 Navbar

**Struktur desktop:** `[LOGO] ............ [KATALOG KOSTUM] [DASHBOARD PENGELOLA] .... [◉ STOK: 17]`
**Struktur mobile:** baris 1 `[LOGO] [◉ 17]`, baris 2 `[KATALOG KOSTUM] [DASHBOARD PENGELOLA]`

| Bagian | Spesifikasi |
|---|---|
| Container | Putih, border-bottom 3px hitam, sticky `top: 0`, `z-index: 30`, height 64/56px |
| Logo | Badge kuning miring `-6deg`, border 3px hitam, shadow `4px 4px 0 #111`, teks `COSTESTANT` Poppins 800 18px hitam, letter-spacing .08em |
| Nav item | Teks UPPERCASE 12px 700; default hitam di atas putih; hover → background kuning + teks hitam + border 2px hitam; active → background hitam + teks kuning + shadow `3px 3px 0 #FFE600` |
| Stock chip | Badge kuning miring `-4deg`, border 2px hitam, dot emerald 8px, teks `STOK: 17` (angka dari statistik SPEC 4.3). Di mobile hanya dot + angka. |

| State | Perlakuan |
|---|---|
| Default | Seperti di atas |
| Hover | Nav item background kuning, logo shadow naik jadi `5px 5px` |
| Focus-visible | Outline merah 3px, offset 2px |
| Active (halaman aktif) | Hitam + kuning, tidak bisa diklik ulang (aria-current="page") |
| Disabled | Tidak ada di navbar |

---

### 3.2 Hero Section

| Bagian | Spesifikasi |
|---|---|
| Latar | `#FFE600` penuh lebar, border-top & bottom 3px hitam, overlay scanline + stripe diagonal 135° di pojok kiri/kanan (1.4) |
| Headline | `SEWA KOSTUM COSPLAY` — Poppins 800 48px (mobile 28px), hitam, UPPERCASE, skew ringan `-2deg`, shadow teks `2px 2px 0 #111111` (tipis, bukan blur) |
| Subheadline | `TEMUKAN KARAKTERMU. PILIH TANGGAL, HITUNG BIAYA, CHAT TOKO.` — 14px 600 hitam, UPPERCASE |
| Search bar | Input putih border 3px hitam, height 52px, placeholder `CARI KARAKTER ATAU SERIES...` (muted), ikon search di kiri; tombol `CARI` hitam + teks kuning + shadow yellow di kanan. **State terhubung** dengan filter bar (satu source of truth) — mengetik di hero langsung menyaring grid, lalu klik `CARI` scroll halus ke `#katalog` |
| CTA | `LIHAT KATALOG` — latar hitam, teks kuning, border 3px kuning, shadow `4px 4px 0 #FFE600`, UPPERCASE, height 52px |
| Hiasan | Kotak hitam kecil bertuliskan `CHANNEL 04 // RENTAL` miring di pojok kanan atas (dekoratif, bukan IP) |

| State | Perlakuan |
|---|---|
| Hover search | Border input tetap hitam, shadow `3px 3px 0 #111` muncul |
| Focus input | Outline merah 3px; placeholder memudar |
| Hover CTA | `translate(-2px,-2px)`, shadow `6px 6px 0 #FFE600` |
| Active CTA | `translate(2px,2px)`, shadow `2px 2px 0 #FFE600` |
| Hasil 0 dari pencarian hero | Tetap di grid, bukan di hero → tampil empty state (3.5) |

---

### 3.3 Bar Filter, Pencarian & Sorting

| Bagian | Spesifikasi |
|---|---|
| Container | Panel putih border 3px hitam, shadow `4px 4px 0 #111`, padding 12–16px, sticky di `≥ lg` (`top: 64px`, `z-index: 20`) |
| Baris 1 — Pencarian | Input kecil (duplikat visual hero, **nilai tersinkron**), lebar 100% di mobile / ~280px di desktop |
| Baris 1 — Kategori | Chip: `SEMUA`, `ANIME`, `GAME`, `TOKUSATSU`, `ORIGINAL` |
| Baris 2 — Ukuran | Chip/select: `SEMUA`, `S`, `M`, `L`, `XL`, `ALL SIZE` |
| Baris 2 — Status | Chip/select: `SEMUA`, `TERSEDIA`, `SEDANG DISEWA`, `PERAWATAN` |
| Baris 2 — Sorting | Native `<select>` bergaya hard-border: `KOSTUM UNGULAN` (default), `HARGA TERENDAH`, `HARGA TERTINGGI` |
| Counter | Teks `8 HASIL` di kanan, font-label hitam |

**Chip state:**

| State | Latar | Teks | Border / Shadow |
|---|---|---|---|
| Default | `#FFFFFF` | `#111111` | 2px hitam, tanpa shadow |
| Selected | `#FFE600` | `#111111` | 3px hitam + `3px 3px 0 #111`, skew `-4deg` |
| Hover | `#FACC15` | `#111111` | 2px hitam, shadow `2px 2px 0 #111` |
| Focus-visible | — | — | Outline merah 3px |
| Active | — | — | `translate(1px,1px)`, shadow `1px 1px 0 #111` |

**Filter aktif marker:** chip selected + tombol teks merah `HAPUS FILTER` (muncul hanya jika ada filter/cari aktif). Klik → kembalikan semua ke default (sesuai F1.7 / AC B10).

---

### 3.4 Grid Kartu Kostum

| Properti | Spesifikasi |
|---|---|
| Grid | `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4`, gap 16/20/24px |
| Kartu | Putih, border 3px hitam, shadow `4px 4px 0 #111`, radius 0 |
| Gambar | `aspect-[4/5]` (boleh `3/4`), `object-fit: cover`, border-bottom 3px hitam, `overflow: hidden`, lazy-load, `onerror` → `/images/placeholder.svg` |
| Badge asal | Pojok kiri atas gambar, kuning + hitam, miring `-6deg`, teks UPPERCASE kecil |
| Bintang unggulan | Pojok kanan atas, merah + outline hitam, hanya saat `unggulan` |
| Tag ukuran | Pojok kanan bawah gambar, kotak hitam + teks putih, `ALL SIZE` diperbolehkan lebih lebar |
| Ribbon harga | Strip kuning miring `-2deg` tepat di bawah gambar, border-top/bottom 2px hitam, teks `RP 100.000 / 2 HARI` Poppins 800 15px hitam, tabular-nums |
| Body | Padding 12–16px: nama UPPERCASE 18px 700; baris `KATEGORI · UKURAN` font-label muted; baris stok `STOK: 3` + badge status |
| Badge status | Tersedia = emerald/hitam; Sedang Disewa = merah/putih; Perawatan = `#F3F4F6`/hitam + border hitam + ikon peringatan |
| Tombol aksi | `LIHAT DETAIL` — kuning, teks hitam, border 3px hitam, shadow `4px 4px 0 #111`, lebar penuh, height 44px |

**State kartu lengkap:**

| State | Perlakuan visual |
|---|---|
| Default | Seperti tabel atas |
| Hover | Kartu `translate(-2px,-2px)`, shadow `6px 6px 0 #111`; gambar `scale(1.02)` dalam overflow hidden; ribbon sedikit lebih kuning (`#FACC15`) |
| Focus-within | Outline merah 3px mengelilingi kartu |
| Active (tombol ditekan) | Tombol `translate(2px,2px)`, shadow `2px 2px 0 #111` |
| **Sedang Disewa** | Badge merah/putih + stamp diagonal merah bertuliskan `DISEWA` di atas gambar (opacity .9, teks putih, border hitam); tombol **disabled** abu `#E5E7EB`, teks `#4B5563`, border `#9CA3AF`, tanpa shadow, `cursor: not-allowed`; keterangan `KOSTUM TIDAK TERSEDIA UNTUK DISEWA.` di bawah tombol |
| **Perawatan** | Stamp abu `#F3F4F6` + ikon peringatan hitam, teks `PERAWATAN`; tombol disabled sama seperti di atas |
| **Stok 0 (status Tersedia)** | Stamp merah `STOK HABIS`, badge status tetap emerald tetapi ditimpa label `HABIS`; tombol disabled |
| Empty state (0 hasil) | Grid diganti panel border 3px hitam + shadow, latar `#F3F4F6`, ikon TV static (SVG garis horizontal), teks besar `TIDAK ADA KOSTUM YANG COCOK.`, subteks `Coba kata kunci atau filter lain.`, tombol merah outline `HAPUS FILTER` |

> Catatan aksesibilitas: tombol disabled tetap bisa dibaca pembaca layar (jangan `display:none`); gunakan atribut `disabled` + `aria-describedby` ke keterangan alasan.

---

### 3.5 Modal Detail & Kalkulator Sewa

| Bagian | Spesifikasi |
|---|---|
| Overlay | `rgba(17,17,17,0.72)` + scanline halus, `z-index: 50`, klik overlay = tutup |
| Panel | Putih, border 3px hitam, shadow `8px 8px 0 #111`, radius 4px, `max-width: 760px`, `max-height: 90vh`, `overflow-y: auto`, `z-index: 51` |
| Header | Strip kuning `#FFE600`, border-bottom 3px hitam, padding 16–20px, judul nama kostum UPPERCASE 24px hitam; tombol ✕ hitam 36×36px, border 3px hitam, teks putih, shadow `3px 3px 0 #111` |
| Body desktop | 2 kolom: kiri gambar `aspect-[4/5]` (lebar ~280px); kanan metadata + deskripsi + kalkulator |
| Body mobile | 1 kolom: gambar → metadata → deskripsi → kalkulator |
| Metadata | Baris label UPPERCASE 11px muted + nilai 14px 600: ASAL, KATEGORI, UKURAN, HARGA PAKET, STOK, STATUS, UNGGULAN |
| Deskripsi | Panel `#F3F4F6`, border 2px hitam, padding 12px, teks sentence case 14px, judul `KELENGKAPAN KOSTUM` UPPERCASE |

**Panel kalkulator (wajib mencolok):**

```
+----------------------------------------------------+
| HITUNG ESTIMASI SEWA                               |
| TANGGAL MULAI  [📅 2026-11-20            ]         |
| DURASI         [ - ] [  5  ] [ + ]  HARI           |
|----------------------------------------------------|
| PAKET 2 HARI   x1              Rp 100.000          |
| TAMBAHAN 3 HARI x Rp 50.000    Rp 150.000          |
|====================================================|
| TOTAL ESTIMASI              Rp 250.000   <-- kuning|
+----------------------------------------------------+
```

| Elemen kalkulator | Spesifikasi |
|---|---|
| Panel | Latar `#F3F4F6`, border 3px hitam, shadow `4px 4px 0 #111` |
| Input tanggal | Putih, border 3px hitam, height 44px, `min` = hari ini; ikon kalender di kiri; focus outline merah |
| Stepper durasi | 3 kotak border 3px hitam: tombol `−`, angka (lebar 72px, teks 20px 800 tabular), tombol `+`; stepper ikut `clamp(2,30)` (SPEC 4.4) |
| Rincian | Font 13px, label UPPERCASE muted, nominal kanan tabular-nums; baris tambahan muncul juga saat 0 hari (`Rp 0`) agar transparan |
| Total | Strip kuning `#FFE600` miring `-2deg`, border 3px hitam, teks `TOTAL ESTIMASI` 12px 700 + angka 28px 800 hitam, shadow `3px 3px 0 #111` |
| Checkbox simulasi | Kotak 20px border 3px hitam; saat centang → isi kuning + centang hitam; label `TANDAI SEBAGAI DISEWA (SIMULASI)` UPPERCASE 11px |

**Tombol WhatsApp:**

| State | Latar / Teks | Keterangan |
|---|---|---|
| Default | `#10B981` / `#111111`, border 3px hitam, shadow `4px 4px 0 #111`, ikon WA + `SEWA VIA WHATSAPP` | Rasio ~7.4:1 ✅ |
| Hover | `#0EA472` / hitam, `translate(-2px,-2px)`, shadow `6px 6px` | Tetap black text |
| Active | `translate(2px,2px)`, shadow `2px 2px` | — |
| Focus-visible | Outline merah 3px | — |
| **Disabled** (status ≠ Tersedia / stok 0) | `#E5E7EB` / `#4B5563`, border `#9CA3AF`, tanpa shadow, `cursor: not-allowed`, ikon diganti peringatan | Tampilkan keterangan merah `KOSTUM TIDAK TERSEDIA UNTUK DISEWA.` di atas tombol (F2.8) |

**State modal lain:**
- Tutup: tombol ✕ / klik overlay / tombol `Esc`; fokus kembali ke kartu pemicu (NFR6).
- Error validasi (tanggal lampau/durasi di luar rentang): border input jadi merah `#E60012`, pesan UPPERCASE 11px merah di bawah input — tapi karena input di-clamp otomatis, ini jarang muncul.
- Toast sukses simulasi: sudut kanan bawah, panel hitam + teks kuning, border 3px kuning, `z-index: 60`.

---

### 3.6 Dashboard Pengelola (CRUD)

| Bagian | Spesifikasi |
|---|---|
| Container | Sama seperti katalog (container 1280px), judul `DASHBOARD PENGELOLA` UPPERCASE + subjudul `KELOLA KATALOG & STOK TOKO` |
| Statistik | Grid `1 / 3 / 3` kolom (mobile/tablet/desktop), gap 16/24px |
| Kartu stat | Putih, border 3px hitam, shadow `4px 4px 0 #111`, strip atas 8px: kuning (Total Katalog), emerald (Unit Tersedia), merah (Sedang Disewa); label UPPERCASE 11px muted; angka 36px 800 hitam; badge kecil di pojok |
| Tabel (≥ lg) | Panel putih border 3px hitam shadow; header hitam + teks kuning UPPERCASE 11px; baris zebra putih / `#F3F4F6`; border-bottom 2px `#D1D5DB`; high emphasis kolom status & aksi |
| Card-list (< lg) | Tiap baris jadi kartu border 3px hitam shadow `3px 3px`, info utama atas, aksi bawah (2 tombol) |
| Kolom | `KOSTUM` (nama + asal), `KATEGORI`, `UKURAN`, `HARGA`, `STOK`, `STATUS` (select), `AKSI` (Edit / Hapus) |
| Select status | Putih, border 3px hitam, height 36px; warna teks mengikuti status (hitam emerald / putih-merah via class), focus outline merah; perubahan langsung tersimpan (F3.4) |
| Tombol Tambah | Kuning + hitam + border 3px + shadow, ikon `+`, UPPERCASE `TAMBAH KOSTUM` |
| Tombol Edit | Putih + teks hitam, border 3px hitam, shadow `3px 3px`, ikon pensil |
| Tombol Hapus | Putih + teks merah `#E60012`, border 3px merah, shadow `3px 3px 0 #E60012`, ikon tempat sampah; hover latar merah + teks putih (4.8:1 ✅) |
| Tombol Reset | Hitam + teks kuning, border 3px kuning, shadow `4px 4px 0 #FFE600`, label `RESET DATA DUMMY`, strip stripe merah di sisi kiri; selalu lewat `window.confirm` |

**Modal form Tambah/Edit:**

| Elemen | Spesifikasi |
|---|---|
| Panel | Sama dengan modal detail, `max-width: 720px`; judul `TAMBAH KOSTUM` / `EDIT KOSTUM` |
| Field | 2 kolom di `≥ md`: nama, asal, kategori(select), ukuran(select), harga, stok, status(select), imageUrl, deskripsi(full width), unggulan(checkbox) |
| Label | UPPERCASE 11px 700 hitam, di atas input |
| Input | Putih, border 3px hitam, height 44px, radius 4px, focus outline merah |
| Error | Border input merah `#E60012`, pesan UPPERCASE 11px merah + ikon peringatan, tepat di bawah field (F3.7) |
| Simpan | Kuning + hitam + border 3px + shadow; Batal = putih + hitam + border 3px |
| Readonly | Field `id` tidak ditampilkan di form (dibuat otomatis) |

**State dashboard tambahan:**

| State | Perlakuan |
|---|---|
| Hover baris tabel | Latar `#FACC15` opacity .35, kursor default (baris bukan link) |
| Hover tombol aksi | Shadow naik 1px + translate |
| Disabled | Tombol Simpan disabled saat ada error validasi (abu, tanpa shadow) |
| Konfirmasi Hapus/Reset | Dialog browser `window.confirm` — pesan singkat UPPERCASE, mis. `HAPUS KOSTUM INI? TINDAKAN INI TIDAK DAPAT DIBATALKAN.` |
| Kostum baru | Muncul di tabel & grid dengan highlight kuning 1.5 detik (opsional, non-blur) |

---

### 3.7 Toast & Feedback (Lintas Komponen)

| Jenis | Latar / Teks | Pesan contoh |
|---|---|---|
| Sukses | Hitam / kuning | `KOSTUM TERSIMPAN.` |
| Peringatan | Kuning / hitam | `PENYIMPANAN LOKAL TIDAK TERSEDIA; PERUBAHAN HANYA SESI INI.` (NFR4) |
| Error | Merah / putih | `GAGAL MENYIMPAN. PERIKSA KEMBALI ISIAN FORM.` |

Posisi: kanan bawah, 16px dari tepi, `z-index: 60`, border 3px hitam, shadow `4px 4px 0 #111`, auto-hilang 3 detik, tombol ✕ kecil.

---

## 4. Wireframe Teks — Desktop (≥ 1024px)

### 4.1 Katalog — Desktop

```
+==================================================================================================+
| //// COSTESTANT ////    KATALOG KOSTUM   |   DASHBOARD PENGELOLA              (o) STOK: 17        |
+==================================================================================================+
| ///////////////// MIDNIGHT RENTAL CHANNEL //////////////////////////////////////////////////// |
| //  SEWA KOSTUM COSPLAY                                        [ CHANNEL 04 // RENTAL ]       //  |
| //  TEMUKAN KARAKTERMU. PILIH TANGGAL, HITUNG BIAYA, CHAT TOKO.                               //  |
| //  [ / CARI KARAKTER ATAU SERIES................ ] [ CARI ]      [ LIHAT KATALOG ]           //  |
| ////////////////////////////////////////////////////////////////////////////////////////////// |
+--------------------------------------------------------------------------------------------------+
| FILTER  [SEMUA][ANIME][GAME][TOKUSATSU][ORIGINAL]  UKURAN [ALL v]  STATUS [SEMUA v]            |
| SORT    [KOSTUM UNGULAN v]                                              8 HASIL   HAPUS FILTER  |
+==================================================================================================+
| +---------------------+ +---------------------+ +---------------------+ +---------------------+  |
| | ASAL: SAILOR MOON * | | ASAL: NARUTO        | | ASAL: ONE PIECE   * | | ASAL: WITCHER       |  |
| |    [ IMAGE 4:5 ]    | |    [ IMAGE 4:5 ]    | |    [ IMAGE 4:5 ] ## | |    [ IMAGE 4:5 ]    |  |
| |                 [M] | |                 [L] | |               [ALL]| |                 [L] |  |
| |=====================| |=====================| |=====================| |=====================|  |
| | RP 100.000 / 2 HARI | | RP 125.000 / 2 HARI | | RP 150.000 / 2 HARI | | RP 200.000 / 2 HARI |  |
| | SAILOR MOON         | | NARUTO UZUMAKI      | | LUFFY GEAR 5       | | GERALT OF RIVIA     |  |
| | ANIME . M . STOK: 3 | | ANIME . L . STOK: 2 | | ANIME . ALL . STOK1| | GAME . L . STOK: 2  |  |
| | [TERSEDIA]          | | [TERSEDIA]          | | [DISEWA]           | | [TERSEDIA]          |  |
| | [  LIHAT DETAIL  ]  | | [  LIHAT DETAIL  ]  | | [ TIDAK TERSEDIA ] | | [  LIHAT DETAIL  ]  |  |
| +---------------------+ +---------------------+ +---------------------+ +---------------------+  |
| +---------------------+ +---------------------+ +---------------------+ +---------------------+  |
| | (kartu 5)           | | (kartu 6)           | | (kartu 7)           | | (kartu 8)           |  |
| +---------------------+ +---------------------+ +---------------------+ +---------------------+  |
+--------------------------------------------------------------------------------------------------+
| FOOTER: COSTESTANT . PROTOTYPE 1 HARI . DATA DUMMY NONPRIBADI . WHATSAPP: 6281234567890 (DEMO)    |
+==================================================================================================+
```

Keterangan simbol: `*` = bintang unggulan · `##` = stamp diagonal "DISEWA" · `TIDAK TERSEDIA` = tombol disabled abu disertai keterangan alasan.

### 4.2 Modal Detail + Kalkulator — Desktop

```
        +--------------------------------------------------------------------------+
        |==========================================================================|
        |  SAILOR MOON                                                     [ X ]    |
        |==========================================================================|
        | +--------------------+  +------------------------------------------------+ |
        | |                    |  | ASAL        : SAILOR MOON                     | |
        | |   IMAGE 4:5        |  | KATEGORI    : ANIME                           | |
        | |   (placeholder)    |  | UKURAN      : M                               | |
        | |                    |  | HARGA PAKET : RP 100.000 / 2 HARI              | |
        | |   [TERSEDIA]  *    |  | STOK        : 3                               | |
        | |                    |  |------------------------------------------------| |
        | +--------------------+  | KELENGKAPAN KOSTUM                             | |
        |                        | Lengkap: wig blonde, mahkota, tongkat bulan,   | |
        |                        | dan sarung tangan.                              | |
        |                        | +--------------------------------------------+  | |
        |                        | | HITUNG ESTIMASI SEWA                       |  | |
        |                        | | TANGGAL MULAI [ / 2026-11-20            ] |  | |
        |                        | | DURASI        [ - ][  5  ][ + ] HARI       |  | |
        |                        | | PAKET 2 HARI  x1            RP 100.000     |  | |
        |                        | | TAMBAHAN 3 HARI x RP 50.000 RP 150.000     |  | |
        |                        | |============================================|  | |
        |                        | | TOTAL ESTIMASI          RP 250.000 <<<     |  | |
        |                        | +--------------------------------------------+  | |
        |                        | [ ] TANDAI SEBAGAI DISEWA (SIMULASI)           | |
        |                        | [ (o) SEWA VIA WHATSAPP ]                      | |
        |                        +------------------------------------------------+ |
        +--------------------------------------------------------------------------+
```

### 4.3 Dashboard — Desktop

```
+==================================================================================================+
| //// COSTESTANT ////    KATALOG KOSTUM   |   DASHBOARD PENGELOLA*             (o) STOK: 17        |
+==================================================================================================+
| DASHBOARD PENGELOLA                                                                              |
| KELOLA KATALOG & STOK TOKO                       [ + TAMBAH KOSTUM ]   [ RESET DATA DUMMY ]      |
+--------------------------------------------------------------------------------------------------+
| +---------------------------+ +---------------------------+ +---------------------------+        |
| |==== KUNING ===============| |==== EMERALD ==============| |==== MERAH ================|        |
| | TOTAL KATALOG             | | TOTAL UNIT TERSEDIA       | | SEDANG DISEWA             |        |
| |           8               | |            17             | |             1             |        |
| | [8 data dummy]            | | [status TERSEDIA saja]    | | [status DISEWA]           |        |
| +---------------------------+ +---------------------------+ +---------------------------+        |
+--------------------------------------------------------------------------------------------------+
| +----------------------------------------------------------------------------------------------+ |
| | KOSTUM / ASAL     | KATEGORI | UKURAN | HARGA       | STOK | STATUS          | AKSI          | |
| |===================|==========|========|=============|======|=================|===============| |
| | SAILOR MOON       | ANIME    | M      | RP 100.000  | 3    | [TERSEDIA   v]  | [E] [H]       | |
| | Sailor Moon       |          |        | /2 HARI     |      |                 |               | |
| |-------------------|----------|--------|-------------|------|-----------------|---------------| |
| | NARUTO UZUMAKI    | ANIME    | L      | RP 125.000  | 2    | [TERSEDIA   v]  | [E] [H]       | |
| |-------------------|----------|--------|-------------|------|-----------------|---------------| |
| | LUFFY GEAR 5      | ANIME    | ALL    | RP 150.000  | 1    | [DISEWA     v]  | [E] [H]       | |
| | ... 5 baris lainnya ...                                                                      | |
| +----------------------------------------------------------------------------------------------+ |
+==================================================================================================+
```

---

## 5. Wireframe Teks — Mobile (< 640px)

### 5.1 Katalog — Mobile

```
+--------------------------------------+
| // COSTESTANT //            (o) 17   |
+--------------------------------------+
| KATALOG KOSTUM* | DASHBOARD PENGELOLA|
+======================================+
| // MIDNIGHT RENTAL CHANNEL //////////|
| SEWA KOSTUM COSPLAY                  |
| TEMUKAN KARAKTERMU. PILIH TANGGAL,   |
| HITUNG BIAYA, CHAT TOKO.             |
| [ / CARI KARAKTER / SERIES... ][CARI]|
| [      LIHAT KATALOG          ]      |
+======================================+
| FILTER                               |
| [SEMUA][ANIME][GAME][TOKUSATSU]      |
| [ORIGINAL]                           |
| UKURAN [ALL v]   STATUS [SEMUA v]    |
| SORT   [KOSTUM UNGULAN v]  8 HASIL   |
| HAPUS FILTER                         |
+--------------------------------------+
| +----------------------------------+ |
| | ASAL: SAILOR MOON             * | |
| |          [ IMAGE 4:5 ]          | |
| |                            [M]  | |
| |==================================| |
| | RP 100.000 / 2 HARI              | |
| | SAILOR MOON                      | |
| | ANIME . M . STOK: 3   [TERSEDIA] | |
| | [       LIHAT DETAIL          ]  | |
| +----------------------------------+ |
| +----------------------------------+ |
| | (kartu berikutnya...)            | |
| +----------------------------------+ |
+--------------------------------------+
```

**Empty state (mobile):**

```
+--------------------------------------+
|            ~ ~ ~ ~ ~                 |
|     [ IKON TV STATIC / GARIS ]       |
|                                      |
|   TIDAK ADA KOSTUM YANG COCOK.       |
|   Coba kata kunci atau filter lain.  |
|                                      |
|      [  HAPUS FILTER  ]              |
+--------------------------------------+
```

### 5.2 Modal Detail — Mobile

```
+--------------------------------------+
|======================================|
| SAILOR MOON                  [ X ]   |
|======================================|
| +----------------------------------+ |
| |         [ IMAGE 4:5 ]            | |
| |      [TERSEDIA]  *               | |
| +----------------------------------+ |
| ASAL       : SAILOR MOON            |
| KATEGORI   : ANIME                  |
| UKURAN     : M                      |
| STOK       : 3                      |
| KELENGKAPAN KOSTUM                  |
| Lengkap: wig blonde, mahkota,       |
| tongkat bulan, sarung tangan.       |
| +----------------------------------+ |
| | HITUNG ESTIMASI SEWA             | |
| | TANGGAL [ / 2026-11-20        ] | |
| | DURASI  [ - ][ 5 ][ + ] HARI    | |
| | PAKET 2 HARI       RP 100.000   | |
| | TAMB. 3 HARI       RP 150.000   | |
| |==================================| |
| | TOTAL ESTIMASI    RP 250.000 << | |
| +----------------------------------+ |
| [ ] TANDAI sbg DISEWA (SIMULASI)     |
| [ (o) SEWA VIA WHATSAPP ]           |
+--------------------------------------+
```

### 5.3 Dashboard — Mobile

```
+--------------------------------------+
| // COSTESTANT //            (o) 17   |
+--------------------------------------+
| KATALOG KOSTUM | DASHBOARD PENGELOLA*|
+======================================+
| DASHBOARD PENGELOLA                  |
| KELOLA KATALOG & STOK TOKO           |
| [ + TAMBAH KOSTUM ]                  |
| [   RESET DATA DUMMY   ]             |
+--------------------------------------+
| +----------------------------------+ |
| | TOTAL KATALOG                    | |
| |              8                   | |
| +----------------------------------+ |
| +----------------------------------+ |
| | TOTAL UNIT TERSEDIA              | |
| |             17                   | |
| +----------------------------------+ |
| +----------------------------------+ |
| | SEDANG DISEWA                    | |
| |              1                   | |
| +----------------------------------+ |
+--------------------------------------+
| KELOLA KOSTUM                        |
| +----------------------------------+ |
| | SAILOR MOON         [TERSEDIA]   | |
| | Sailor Moon . ANIME . M          | |
| | RP 100.000 / 2 HARI . STOK: 3    | |
| | STATUS [TERSEDIA   v]            | |
| | [ EDIT ]        [ HAPUS ]        | |
| +----------------------------------+ |
| | LUFFY GEAR 5         [DISEWA]    | |
| | ... STATUS [DISEWA v]            | |
| | [ EDIT ]        [ HAPUS ]        | |
| +----------------------------------+ |
+--------------------------------------+
```

---

## 6. Checklist Visual Sebelum Coding (Ringkas)

- [ ] Semua teks di atas kuning/emerald berwarna **hitam**, semua teks di atas merah berwarna **putih**.
- [ ] Tidak ada `box-shadow` blur; semua shadow solid `Npx Npx 0 #111`.
- [ ] Border tebal 3px hitam hadir di kartu, panel, tombol, modal, navbar.
- [ ] Label pendek UPPERCASE + skew `-4° … -6°`; deskripsi tetap sentence case.
- [ ] Badge status selalu punya teks, bukan hanya warna.
- [ ] Tombol kostum `DISEWA` / `PERAWATAN` / stok 0 benar-benar `disabled` + keterangan alasan.
- [ ] Empty state muncul dengan tombol `HAPUS FILTER`.
- [ ] Modal bisa ditutup 3 cara dan fokus kembali ke kartu.
- [ ] Pencarian hero & filter bar memakai satu nilai yang sama (tidak bisa beda).
- [ ] Angka statistik mengikuti `SPEC.md` 4.3: **8 / 17 / 1**.
- [ ] Nomor `6281234567890` hanya muncul sebagai label demo di footer, bukan data pribadi.
- [ ] Breakpoint 1 / 2 / 3 / 4 kolom sesuai Bagian 2; tidak ada horizontal scroll di mobile.
- [ ] `focus-visible` merah `#E60012` terlihat di semua elemen interaktif.

---

## 7. Catatan Implementasi UI (Tanpa Kode)

1. Terapkan desain token di `tailwind.config.js` (warna, fontFamily, boxShadow custom, borderRadius) agar tidak ada hardcode hex bersebaran.
2. Satu komponen `StatusBadge` dipakai ulang di kartu, modal, dan dashboard — jangan tiga implementasi warna.
3. Satu komponen `HardButton` dengan varian `primary` (kuning), `dark` (hitam/kuning), `whatsapp` (emerald/hitam), `danger` (putih/merah), `disabled`.
4. Scanline dibuat sebagai pseudo-element (`::before`) dengan `pointer-events:none` agar tidak menghalangi klik.
5. Sinkronisasi pencarian hero ↔ filter bar lewat satu state di `main.js`, lalu turunkan ke `catalog.js`.
6. Jangan menambah animasi scanline berjalan terus-menerus di mobile (hemat baterai & hindari gangguan fokus).

> Dokumen ini hanya spesifikasi visual. Logika bisnis, validasi, dan acceptance criteria tetap berada di `SPEC.md`. Jika konflik, **ikutkan `SPEC.md` untuk perilaku, `UI-SPEC.md` untuk tampilan**, lalu catat revisi versi di header dokumen terkait.
