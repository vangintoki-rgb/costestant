# SPEC.md — Costestant

> Spesifikasi teknis dan produk untuk **Costestant**, platform katalog & pemesanan sewa kostum cosplay berbasis web.
> Versi dokumen: `1.0` — Target pengerjaan: **prototyping 1 hari**.
> Status: **Siap dijadikan acuan implementasi. Belum ada kode aplikasi pada tahap ini.**

---

## 1. Tujuan & Gambaran Umum Aplikasi

### 1.1 Tujuan
Costestant dirancang untuk mempermudah dua aktivitas dalam satu aplikasi tanpa backend:

1. **Calon penyewa** dapat menjelajahi katalog kostum, membandingkan harga, menghitung estimasi biaya sewa, lalu melanjutkan pemesanan through WhatsApp dengan pesan yang sudah terisi otomatis.
2. **Pengelola toko** dapat mengelola data katalog (CRUD), mengubah status ketersediaan, dan melihat ringkasan stok secara langsung di perangkat yang sama.

### 1.2 Gambaran Umum
- Aplikasi **single-page, client-side only**, berjalan di browser.
- Satu perangkat dipakai bergantian oleh penyewa dan pengelola; **tidak ada autentikasi/login** (sesuai batasan prototyping).
- Seluruh data disimpan di `localStorage` browser. Data awal berupa **8 kostum contoh nonpribadi** yang bisa dikembalikan lewat tombol **Reset ke Data Awal**.
- "Pemesanan" bukan transaksi pembayaran: aplikasi hanya menyiapkan **tautan `wa.me` dengan pesan pre-filled**. Penyelesaian sewa dilakukan manual di luar aplikasi.

### 1.3 Definisi Selesai (Prototype)
Aplikasi dianggap selesai jika seluruh **Acceptance Criteria (Bagian 8)** lolos saat diuji manual di browser, baik di desktop maupun di viewport mobile.

---

## 2. Target Pengguna & Alur Penggunaan

### 2.1 Target Pengguna
| Peran | Kebutuhan Utama | Akses di Aplikasi |
|---|---|---|
| **Calon Penyewa (Cosplayer)** | Mencari kostum sesuai karakter/series, ukuran, budget; tahu estimasi biaya; menghubungi toko cepat | Tab/panel **Katalog** + modal **Detail & Kalkulator** |
| **Pengelola Toko** | Menambah/edit/hapus kostum, memperbarui status, memantau stok | Tab/panel **Dashboard** + kartu **Statistik** |

Kedua peran memakai **perangkat dan browser yang sama**. Tidak ada pembedaan hak akses.

### 2.2 Alur Penggunaan — Calon Penyewa
1. Buka aplikasi → mendarat di **Katalog** dengan 8 kartu kostum.
2. (Opsional) Ketik nama karakter/series di kolom **Pencarian**.
3. (Opsional) Terapkan **filter** kategori, ukuran, dan/atau status; pilih **sorting**.
4. Klik kartu / tombol **Lihat Detail** kostum yang diminati.
5. Di modal detail: baca deskripsi kelengkapan, pilih **tanggal mulai sewa** dan **durasi (hari)**.
6. Sistem menampilkan **estimasi total biaya** secara otomatis (tanpa tombol hitung).
7. Klik **Sewa via WhatsApp** → browser membuka `wa.me/6281234567890?text=...` dengan pesan terisi.
8. (Simulasi, opsional) Centang **"Tandai sebagai disewa (simulasi)"** sebelum mengirim untuk menurunkan stok & memperbarui status — lihat Aturan 4.4.

### 2.3 Alur Penggunaan — Pengelola
1. Beralih ke tab **Dashboard**.
2. Lihat kartu statistik: total katalog, total unit stok tersedia, jumlah kostum sedang disewa.
3. Pilih aksi:
   - **Tambah Kostum** → isi form → Simpan → kartu baru muncul di katalog.
   - **Edit** → ubah field → Simpan.
   - **Ubah Status** → pilih Tersedia / Sedang Disewa / Perawatan.
   - **Hapus** → konfirmasi → data terhapus.
   - **Reset ke Data Awal** → konfirmasi → 8 data contoh kembali.
4. Kembali ke **Katalog** untuk memverifikasi perubahan.

### 2.4 Alur Antar-Keadaan (Ringkas)
```
[Buka Aplikasi]
      │
      ├── Katalog ──(cari/filter/sort)──> Daftar tersaring ──(klik kartu)──> Modal Detail
      │                                                                       │
      │                                                    (tanggal + durasi) │
      │                                                                       ▼
      │                                                              Estimasi Biaya
      │                                                                       │
      │                                                          (Sewa via WhatsApp)
      │                                                                       ▼
      │                                                        wa.me (pesan pre-filled)
      │
      └── Dashboard ──> Statistik + CRUD + Reset ──> localStorage ──> Katalog ter-update
```

---

## 3. Daftar Fitur MVP

### 3.1 Fitur Katalog (Penyewa)
| ID | Fitur | Detail Perilaku |
|---|---|---|
| F1.1 | **8 kostum contoh** | Seed data nonpribadi, lengkap dengan foto/placeholder lokal. Lihat lampiran seed di Bagian 4.6. |
| F1.2 | **Kartu kostum** | Menampilkan gambar, nama, asal series, kategori, ukuran, harga (`Rp 100.000 / 2 hari`), stok, dan badge status. |
| F1.3 | **Badge status** | `Tersedia` (hijau), `Sedang Disewa` (kuning/oranye), `Perawatan` (abu/merah). Warna konsisten di kartu, modal, dan dashboard. |
| F1.4 | **Pencarian** | Case-insensitive, substring pada `nama` **ATAU** `asal`. Kosong → tampil semua. |
| F1.5 | **Filter** | Kategori (Semua / Anime / Game / Tokusatsu / Original), Ukuran (Semua / S / M / L / XL / All Size), Status (Semua / 3 status). Gabungan filter bersifat **AND**. |
| F1.6 | **Sorting** | `Harga Terendah` (asc), `Harga Tertinggi` (desc), `Kostum Unggulan` (`unggulan=true` lebih dulu, lalu `nama` A–Z). Default: **Kostum Unggulan**. |
| F1.7 | **Empty state** | Jika tidak ada hasil: teks "Tidak ada kostum yang cocok." + tombol **Hapus Filter** yang mengembalikan pencarian & filter ke default. |
| F1.8 | **Badge Unggulan** | Penanda visual kecil (mis. bintang/⭐) pada kartu jika `unggulan === true`. |

### 3.2 Fitur Detail, Kalkulator & WhatsApp (Penyewa)
| ID | Fitur | Detail Perilaku |
|---|---|---|
| F2.1 | **Modal detail** | Muncul saat kartu diklik; menampilkan gambar besar, semua metadata, dan `deskripsi` (kelengkapan: wig, aksesoris, senjata). Bisa ditutup via tombol ✕, klik overlay, atau tombol `Esc`. |
| F2.2 | **Input tanggal mulai** | `<input type="date">`, **minimal hari ini** (tidak boleh tanggal lampau). Default: hari ini. |
| F2.3 | **Input durasi** | Angka hari, **minimum 2** (paket standar), maksimum 30. Step 1 hari. Bisa diubah langsung atau dengan tombol − / +. |
| F2.4 | **Kalkulator otomatis** | Estimasi dihitung ulang seketika saat tanggal/durasi berubah. Menampilkan rincian: tarif paket 2 hari, jumlah hari tambahan, tarif per hari tambahan, dan **total**. Format Rupiah `id-ID` (contoh: `Rp 250.000`). |
| F2.5 | **Tombol Sewa via WhatsApp** | Membuka `https://wa.me/6281234567890?text=<encodeURIComponent(pesan)>` di tab baru (`target="_blank" rel="noopener noreferrer"`). Nonaktif jika status bukan `Tersedia` atau `stok === 0`. |
| F2.6 | **Pesan pre-filled** | Memuat: nama kostum, asal series, ukuran, tanggal mulai, durasi, estimasi total. Format final ada di Bagian 4.5. |
| F2.7 | **Konfirmasi simulasi sewa** | Checkbox opsional "Tandai sebagai disewa (simulasi)". Jika dicentang saat klik WA, jalankan Aturan 4.4 sebelum membuka tautan. |
| F2.8 | **Pencegahan sewa invalid** | Jika kostum `Perawatan` / `Sedang Disewa` / stok 0, tombol WA dinonaktifkan dan ditampilkan alasan: "Kostum tidak tersedia untuk disewa." |

### 3.3 Fitur Dashboard Pengelola (CRUD)
| ID | Fitur | Detail Perilaku |
|---|---|---|
| F3.1 | **Statistik toko** | 3 kartu: **Total Katalog** (`kostum.length`), **Unit Stok Tersedia** (lihat 4.3), **Kostum Sedang Disewa** (lihat 4.3). |
| F3.2 | **Tambah kostum** | Form modal dengan semua field data model. `id` otomatis via `crypto.randomUUID()`, `unggulan` default `false`. |
| F3.3 | **Edit kostum** | Form modal terisi data lama; `id` tidak bisa diubah. Perubahan langsung tersimpan ke localStorage. |
| F3.4 | **Ubah status cepat** | `<select>` status di baris tabel/daftar dashboard; perubahan langsung tersimpan tanpa tombol Simpan terpisah. |
| F3.5 | **Hapus kostum** | Klik Hapus → dialog konfirmasi browser (`window.confirm`) → hapus dari array → simpan. Batal → tidak ada perubahan. |
| F3.6 | **Reset ke data awal** | Tombol di dashboard → `window.confirm` → timpa localStorage dengan 8 seed → tampilan katalog ter-refresh. |
| F3.7 | **Validasi form** | Validasi client-side sesuai Bagian 4.2; pesan error inline per field; Simpan gagal jika ada error. |
| F3.8 | **Daftar/table dashboard** | Menampilkan nama, asal, kategori, ukuran, harga, stok, status, dan aksi Edit/Hapus. Bisa memakai tabel (desktop) yang scroll horizontal di mobile. |

---

## 4. Data Model & Aturan Validasi

### 4.1 Struktur Data Kostum
Disimpan sebagai array of object di localStorage dengan key **`costestant.kostum.v1`**.

| Field | Tipe | Wajib | Aturan | Contoh |
|---|---|---|---|---|
| `id` | string (UUID) | ✅ | Dibuat via `crypto.randomUUID()`; immutable; unik | `9f1c2e7a-...` |
| `nama` | string | ✅ | 3–80 karakter; trim spasi | `Sailor Moon` |
| `asal` | string | ✅ | 2–80 karakter; trim spasi | `Sailor Moon` |
| `kategori` | string (enum) | ✅ | `Anime` \| `Game` \| `Tokusatsu` \| `Original` | `Anime` |
| `ukuran` | string (enum) | ✅ | `S` \| `M` \| `L` \| `XL` \| `All Size` | `M` |
| `hargaPer2Hari` | number | ✅ | Bilangan bulat, `>= 0`, `<= 100000000`; default `100000` | `100000` |
| `stok` | integer | ✅ | Bilangan bulat, `>= 0`, `<= 999` | `3` |
| `status` | string (enum) | ✅ | `Tersedia` \| `Sedang Disewa` \| `Perawatan` | `Tersedia` |
| `deskripsi` | string | ✅ | 10–500 karakter; sebutkan kelengkapan (wig/aksesoris/senjata) | `Lengkap: wig, mahkota, tongkat, dan sarung tangan.` |
| `imageUrl` | string | ✅ | Path lokal relatif, mis. `/images/kostum-01.svg`, atau placeholder. Jika gagal dimuat → fallback placeholder. | `/images/kostum-01.svg` |
| `unggulan` | boolean | ✅ | Default `false` | `true` |

**Contoh satu objek (kanonik):**
```js
{
  id: "9f1c2e7a-6b4d-4f8a-9c11-2a7e5b0d3f64",
  nama: "Sailor Moon",
  asal: "Sailor Moon",
  kategori: "Anime",
  ukuran: "M",
  hargaPer2Hari: 100000,
  stok: 3,
  status: "Tersedia",
  deskripsi: "Lengkap: wig blonde, mahkota, tongkat bulan, dan sarung tangan.",
  imageUrl: "/images/kostum-01.svg",
  unggulan: true
}
```

### 4.2 Aturan Validasi Form (Tambah/Edit)
1. `nama`, `asal`, `deskripsi`: trim dulu; Tolak jika kosong atau di luar rentang panjang.
2. `kategori`, `ukuran`, `status`: harus salah satu dari enum; select dibuat default pilihan valid.
3. `hargaPer2Hari`: `Number(value)`; tolak `NaN`, desimal, negatif, atau `> 100000000`.
4. `stok`: `Number(value)`; tolak `NaN`, desimal, negatif, atau `> 999`.
5. `imageUrl`: boleh kosong → isi otomatis dengan placeholder `/images/placeholder.svg`.
6. `unggulan`: checkbox → boolean.
7. Jika ada error: **jangan** menulis ke localStorage; tampilkan pesan di samping field terkait dan fokus ke field pertama yang error.
8. Semua teks bebas (`nama`, `asal`, `deskripsi`) wajib dirender dengan `textContent` (atau di-escape), **dilarang** `innerHTML` langsung dari input user.

### 4.3 Aturan Statistik Toko
```
totalKatalog      = kostum.length
unitStokTersedia  = Σ k.stok  untuk k.status === 'Tersedia'
kostumDisewa      = jumlah k dengan k.status === 'Sedang Disewa'
```
- Kostum berstatus `Perawatan` **tidak** masuk `unitStokTersedia` meski `stok > 0`.
- Kostum berstatus `Sedang Disewa` **tidak** masuk `unitStokTersedia`.
- Statistik dihitung ulang setiap kali data berubah (CRUD, status, reset, simulasi sewa).

### 4.4 Aturan Perhitungan Durasi Sewa & Perubahan Status

**Perhitungan biaya:**
```
hargaHariTambahan = Math.ceil(hargaPer2Hari / 2)
durasiEfektif     = clamp(durasiInput, 2, 30)     // minimum 2 hari
hariTambahan      = durasiEfektif - 2
total             = hargaPer2Hari + (hariTambahan * hargaHariTambahan)
```
- `durasiInput` di bawah 2 → dipaksa 2; di atas 30 → dipaksa 30; field ditampilkan terclamp.
- Contoh: `hargaPer2Hari = 100000`, durasi 5 hari → `100000 + 3 * 50000 = Rp 250.000`.
- Contoh: durasi 2 hari → `Rp 100.000` (tanpa hari tambahan).
- Tanggal mulai **tidak** menambah biaya; hanya dipakai di pesan WhatsApp.

**Perubahan status — tiga jalur:**
1. **Manual oleh pengelola (F3.4):** status dapat diubah kapan saja ke salah satu enum. Jika diubah ke `Sedang Disewa`, pengelola bertanggung jawab menyesuaikan `stok` lewat Edit (sistem **tidak** mengubah stok otomatis pada jalur manual).
2. **Simulasi sewa dari penyewa (F2.7), hanya jika status awal `Tersedia` dan `stok > 0`:**
   - Jika `stok > 1` → `stok = stok - 1`, status tetap `Tersedia`.
   - Jika `stok === 1` → `stok = 0`, status berubah menjadi `Sedang Disewa`.
3. **Perawatan → Tersedia:** pengelola mengubah status lewat F3.4; `stok` tidak berubah otomatis.

**Konsistensi:**
- Jika `status === 'Sedang Disewa'` maka tombol sewa nonaktif (F2.8).
- Jika `stok === 0` maka tombol sewa nonaktif meski status `Tersedia`.
- Jika `status === 'Perawatan'` maka tombol sewa nonaktif.
- Semua perubahan status tersimpan ke localStorage segera.

### 4.5 Format Pesan WhatsApp (Pre-filled)
```
Halo Costestant, saya ingin menyewa kostum:

Kostum   : Sailor Moon
Asal     : Sailor Moon
Ukuran   : M
Mulai    : 2026-11-20
Durasi   : 5 hari (paket 2 hari + 3 hari tambahan)
Estimasi : Rp 250.000

Mohon konfirmasi ketersediaannya. Terima kasih!
```
- `Mulai` diformat `YYYY-MM-DD` sesuai nilai input date.
- `Estimasi` memakai formatter Rupiah `id-ID`.
- Nomor tujuan: konstanta `WHATSAPP_NUMBER = '6281234567890'` (**placeholder**).
- URL akhir: `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(pesan)}`.

### 4.6 Seed Data — 8 Kostum Contoh (Nonpribadi)
| # | nama | asal | kategori | ukuran | hargaPer2Hari | stok | status | unggulan | imageUrl |
|---|---|---|---|---|---|---|---|---|---|
| 1 | Sailor Moon | Sailor Moon | Anime | M | 100000 | 3 | Tersedia | true | `/images/kostum-01.svg` |
| 2 | Naruto Uzumaki | Naruto | Anime | L | 125000 | 2 | Tersedia | true | `/images/kostum-02.svg` |
| 3 | Luffy Gear 5 | One Piece | Anime | All Size | 150000 | 1 | Sedang Disewa | true | `/images/kostum-03.svg` |
| 4 | Geralt of Rivia | The Witcher | Game | L | 200000 | 2 | Tersedia | false | `/images/kostum-04.svg` |
| 5 | Samus Aran | Metroid | Game | M | 175000 | 0 | Perawatan | false | `/images/kostum-05.svg` |
| 6 | Ultraman Tiga | Ultraman | Tokusatsu | All Size | 140000 | 4 | Tersedia | false | `/images/kostum-06.svg` |
| 7 | Kamen Rider Zero-One | Kamen Rider | Tokusatsu | XL | 180000 | 1 | Tersedia | false | `/images/kostum-07.svg` |
| 8 | Starlight Wanderer | Original | Original | S | 90000 | 5 | Tersedia | false | `/images/kostum-08.svg` |

- `deskripsi` tiap seed wajib diisi kalimat Indonesia yang menyebut kelengkapan (contoh: "Lengkap: wig, aksesoris, dan senjata kayu.").
- `imageUrl` di atas boleh diganti placeholder generik `/images/placeholder.svg` bila aset belum tersedia; **wajib ada fallback** jika file gambar gagal dimuat.
- Seed ini dipakai ulang persis oleh tombol **Reset ke Data Awal**.

### 4.7 Penyimpanan & Reset
- Key localStorage: `costestant.kostum.v1` (array JSON).
- Opsional key meta: `costestant.meta.v1` = `{ "version": 1, "lastReset": "<ISO>" }`.
- Saat aplikasi dibuka:
  - Jika key belum ada / JSON rusak / bukan array → inisialisasi dengan seed (F1.1) dan simpan.
  - Jika valid → pakai data dari localStorage.
- Reset = tulis ulang seed + perbarui meta + render ulang seluruh tampilan.
- Baca/tulis localStorage **selalu** dibungkus `try/catch` (lihat R1).

---

## 5. Non-Functional Requirements (NFR)

| ID | Kategori | Requirement |
|---|---|---|
| NFR1 | Responsif | Layout valid di 3 breakpoint: mobile `< 640px` (1 kolom kartu, filter stack), tablet `≥ 640px` (2 kolom), desktop `≥ 1024px` (3–4 kolom). Tidak ada horizontal scroll pada halaman utama (kecuali tabel dashboard di mobile yang boleh scroll horizontal). |
| NFR2 | Performa | Render 8–50 kartu < 100 ms di browser modern. Pencarian/filter/sorting dilakukan di memori, tanpa request jaringan. Tidak ada framework UI/additional state library. |
| NFR3 | Persistensi | Semua mutasi (CRUD, status, reset, simulasi sewa) langsung tersimpan ke localStorage dan tetap ada setelah **refresh/hard reload**. |
| NFR4 | Ketahanan Data | localStorage gagal (private mode / kuota penuh) → aplikasi tetap berjalan dengan data in-memory + toast peringatan: "Penyimpanan lokal tidak tersedia; perubahan hanya berlaku sesi ini." |
| NFR5 | Gambar | Setiap `<img>` punya `alt` descriptive dan handler `onerror` → fallback `/images/placeholder.svg`. Gambar tidak boleh mem-blok render (lazy loading untuk kartu di bawah lipatan). |
| NFR6 | Aksesibilitas | Tombol/input punya label; modal bisa ditutup dengan `Esc`; fokus berpindah ke modal saat dibuka dan kembali ke elemen pemicu saat ditutup; kontras teks memadai (minimal 4.5:1). |
| NFR7 | Keamanan Data | Tidak ada API key, token, atau nomor pribadi asli di kode. Satu-satunya nomor: placeholder `6281234567890`. Input user dirender aman (textContent/escape). |
| NFR8 | Konsistensi UI | Satu source of truth untuk enum status/kategori/ukuran dan formatter Rupiah. Warna badge status identik di katalog, modal, dan dashboard. |
| NFR9 | Kompatibilitas | Berjalan di Chrome/Edge/Firefox versi terkini mendukung ES2020+ (`crypto.randomUUID`, `encodeURIComponent`, `Intl.NumberFormat`). Jika `crypto.randomUUID` tidak ada → fallback generator UUID sederhana. |
| NFR10 | Kualitas Kode | Tombol reset & hapus selalu melalui konfirmasi. Tidak ada `console.error` / uncaught exception saat alur normal maupun saat menguji empty state. |

### 5.1 Tech Stack (Fixed)
- **Build tool:** Vite
- **Bahasa:** Vanilla JavaScript (ES Modules), tanpa TypeScript, tanpa framework UI
- **Styling:** Tailwind CSS
- **Backend / DB / Login:** **Tidak ada**
- **Struktur folder yang disarankan:**
```
costestant/
├── index.html
├── package.json
├── vite.config.js
├── tailwind.config.js
├── postcss.config.js
└── src/
    ├── main.js            # entry, routing tab sederhana
    ├── data/seed.js       # 8 kostum contoh + konstanta enum
    ├── storage.js         # load/save/reset localStorage + try/catch
    ├── utils.js           # formatRupiah, clamp, uuid, escapeHtml, calcSewa
    ├── ui/
    │   ├── catalog.js     # render kartu, search, filter, sort, empty state
    │   ├── detailModal.js # modal, kalkulator, WA link, simulasi sewa
    │   └── dashboard.js   # statistik, CRUD form, status select, reset
    └── styles.css         # @tailwind directives + utility tambahan
public/
└── images/
    ├── kostum-01.svg ... kostum-08.svg
    └── placeholder.svg
```

---

## 6. Risiko & Mitigasi

| ID | Risiko | Dampak | Mitigasi |
|---|---|---|---|
| R1 | localStorage tidak tersedia / kuota penuh / JSON korup | Data hilang atau aplikasi error | `try/catch` pada semua akses; fallback in-memory + toast (NFR4); validasi tipe array saat load; auto-reseed jika rusak |
| R2 | Nomor WhatsApp placeholder tidak sengaja dipakai produksi | Pesan terkirim ke nomor salah/simulasi | Simpan sebagai konstanta `WHATSAPP_NUMBER` dengan komentar jelas "PLACEHOLDER — ganti sebelum produksi"; tidak pernah hardcode nomor lain |
| R3 | Input user memuat HTML/JS berbahaya | XSS saat render nama/deskripsi | `textContent` / escape; dilarang `innerHTML` untuk data user (4.2.8) |
| R4 | Durasi diisi 0, negatif, atau Tanggal lampau | Estimasi biaya/logika sewa salah | `clamp(2,30)` + `min` atribut pada input date = hari ini (2.2, 4.4) |
| R5 | Status vs stok tidak konsisten (misal status Tersedia tapi stok 0) | Tombol sewa aktif padahal tidak bisa disewa | Validasi di 4.4: tombol WA nonaktif jika status bukan Tersedia **atau** stok 0; semua jalur perubahan status mematuhi 4.4 |
| R6 | Gambar lokal tidak ditemukan saat build | Kartu tampak rusak | `onerror` fallback `placeholder.svg` (NFR5); seed memperbolehkan path placeholder |
| R7 | Reset/hapus tanpa konfirmasi | Data pengelola hilang | `window.confirm` wajib untuk F3.5 dan F3.6 |
| R8 | Modal tidak bisa ditutup di mobile | Pengguna terjebak | 3 jalur tutup: ✕, overlay, `Esc` + focus return (F2.1, NFR6) |
| R9 | Scope creep (payment, login, backend) di hari yang sama | Prototype tidak selesai | Rujuk Bagian 7 Out-of-Scope; implementasi mengikuti Bagian 9 secara berurutan |
| R10 | `crypto.randomUUID` tidak didukung browser lama | Tambah kostum gagal | Fallback generator UUID di `utils.js` (NFR9) |
| R11 | Filter + pencarian + sorting digabung menghasilkan hasil tak terduga | Bingung pengguna | Urutan pipeline tetap: **cari → filter → sort**; tombol "Hapus Filter" mengembalikan semuanya (F1.7) |

---

## 7. Out-of-Scope (Sengaja Tidak Dibuat di Versi 1 Hari)

1. **Autentikasi & manajemen peran/login** (termasuk login palsu).
2. **Backend, REST API, database eksternal** (Supabase/Firebase/MySQL, dll).
3. **Payment gateway / pembayaran online / invoice / bukti transfer.**
4. **WhatsApp Business API / auto-send sungguhan** — hanya tautan `wa.me` yang dibuka browser.
5. **Multi-perangkat / sinkronisasi real-time / riwayat perubahan data.**
6. **Upload gambar dari perangkat / CDN** — hanya path lokal/placeholder.
7. **Kalender reservasi, deteksi bentrok jadwal, atau blackout date.**
8. **Riwayat transaksi sewa, keranjang, atau checkout multi-kostum.**
9. **Review, rating, komentar, wishlist, atau rekomendasi personal.**
10. **Notifikasi email/SMS/push**, PWA/service worker/offline mode.
11. **Internasionalisasi / multi-bahasa** (UI bahasa Indonesia saja).
12. **Testing otomatis (unit/e2e), CI/CD, deployment produksi.**
13. **Nomor WhatsApp asli / data pribadi penyewa maupun pemilik toko.**

---

## 8. Acceptance Criteria (Daftar Periksa Pengujian Manual)

> Cara uji: jalankan `npm install && npm run dev`, buka URL Vite di browser, lalu cek poin berikut satu per satu. Tandai ✅/❌.

### A. Inisialisasi & Data Awal
- [ ] **A1** Saat dibuka pertama kali, Katalog menampilkan **tepat 8 kartu kostum**.
- [ ] **A2** Setiap kartu memuat gambar/placeholder yang tampil (tidak broken), nama, asal, kategori, ukuran, harga dengan format `Rp ... / 2 hari`, jumlah stok, dan badge status yang sesuai (3 variasi warna).
- [ ] **A3** Nama, asal, dan deskripsi memakai bahasa Indonesia dan bukan data pribadi.
- [ ] **A4** Tidak ada kolom/login yang meminta email, password, atau nomor pribadi di seluruh aplikasi.

### B. Pencarian, Filter & Sorting
- [ ] **B1** Mengetik `naruto` di pencarian menyisakan kartu **Naruto Uzumaki** saja.
- [ ] **B2** Mengetik `witcher` (asal series) juga menemukan **Geralt of Rivia** → membuktikan pencarian bekerja pada `nama` **dan** `asal`.
- [ ] **B3** Pencarian `NARUTO` (huruf kapital) tetap menemukan hasil → case-insensitive.
- [ ] **B4** Filter kategori `Tokusatsu` hanya menampilkan kostum Ultraman Tiga & Kamen Rider Zero-One.
- [ ] **B5** Filter ukuran `All Size` hanya menampilkan kostum berukuran All Size.
- [ ] **B6** Filter status `Perawatan` hanya menampilkan **Samus Aran**.
- [ ] **B7** Menggabungkan pencarian `kamen` + kategori `Tokusatsu` + ukuran `XL` menghasilkan tepat **1 kartu** (AND logic).
- [ ] **B8** Sorting `Harga Terendah` menampilkan Starlight Wanderer (`Rp 90.000`) paling atas; `Harga Tertinggi` menampilkan Geralt of Rivia (`Rp 200.000`) paling atas.
- [ ] **B9** Sorting `Kostum Unggulan` menampilkan 3 kostum ber-`unggulan=true` lebih dulu (Sailor Moon, Naruto, Luffy), diurutkan A–Z di dalam grupnya.
- [ ] **B10** Pencarian `zzzz` menampilkan empty state + tombol **Hapus Filter**; setelah diklik, 8 kartu kembali dan field pencarian kosong.

### C. Detail & Kalkulator
- [ ] **C1** Klik kartu → modal terbuka, menampilkan deskripsi lengkap (sebut wig/aksesoris/senjata) dan semua metadata.
- [ ] **C2** Modal bisa ditutup dengan tombol ✕, klik di luar modal, **dan** tombol `Esc`; fokus kembali ke kartu yang diklik.
- [ ] **C3** Tanggal mulai default = hari ini dan tidak bisa diisi tanggal kemarin (validasi/min atribut).
- [ ] **C4** Durasi default 2 hari; mencoba mengisi `1` atau `0` → otomatis menjadi **2**; mengisi `31` → menjadi **30**.
- [ ] **C5** Pada Sailor Moon (`Rp 100.000 / 2 hari`), durasi 2 hari → estimasi **Rp 100.000**.
- [ ] **C6** Durasi diubah ke 5 hari → estimasi berubah otomatis menjadi **Rp 250.000** (rincian: 2 hari + 3 hari × Rp 50.000) tanpa klik tombol hitung.
- [ ] **C7** Mengubah tanggal mulai tidak mengubah nominal estimasi, hanya berpengaruh ke pesan WhatsApp.
- [ ] **C8** Buka modal **Luffy Gear 5** (status `Sedang Disewa`) → tombol **Sewa via WhatsApp** abu/nonaktif dan muncul alasan "Kostum tidak tersedia untuk disewa." Berlaku juga untuk Samus Aran (Perawatan) dan kostum dengan stok 0.

### D. WhatsApp Pre-filled
- [ ] **D1** Klik **Sewa via WhatsApp** pada Sailor Moon (durasi 5 hari, mulai 2026-11-20) → tab baru terbuka ke `wa.me` dengan nomor **`6281234567890`**.
- [ ] **D2** Pesan di kolom chat memuat semua 6 informasi: nama kostum, asal series, ukuran, tanggal mulai, durasi (dengan rincian hari tambahan), dan estimasi `Rp 250.000` — sesuai format Bagian 4.5.
- [ ] **D3** Tidak ada nomor telepon pribadi asli/API key yang muncul di UI maupun di source code yang terlihat.
- [ ] **D4** (Opsional) Centang "Tandai sebagai disewa (simulasi)" lalu klik WA → stok Sailor Moon turun dari 3 ke 2 dan status tetap `Tersedia`; ulangi hingga stok 0 → status berubah `Sedang Disewa`.

### E. Dashboard CRUD & Statistik
- [ ] **E1** Beralih ke Dashboard → 3 kartu statistik menampilkan: Total Katalog **8**, Unit Stok Tersedia **17** (3+2+2+4+1+5; Luffy `Sedang Disewa` dan Samus `Perawatan` tidak dihitung), Kostum Sedang Disewa **1**.
- [ ] **E2** Tambah kostum baru dengan data valid → muncul di Katalog (total katalog jadi **9**), statistik bertambah, dan data tetap ada setelah **refresh**.
- [ ] **E3** Tambah kostum dengan harga negatif / stok desimal / nama 2 karakter → Simpan ditolak, pesan error muncul per field, data tidak berubah.
- [ ] **E4** Edit kostum (misal ganti harga Naruto jadi `Rp 150.000`) → perubahan tampil di kartu & kalkulator setelah refresh.
- [ ] **E5** Ubah status cepat Samus Aran dari `Perawatan` → `Tersedia` → badge di katalog ikut hijau dan Unit Stok Tersedia bertambah 0 (stok tetap 0, sesuai aturan 4.3).
- [ ] **E6** Klik Hapus → muncul konfirmasi; pilih Batal → data tetap; pilih OK → kostum hilang dari katalog & statistik berkurang.
- [ ] **E7** Klik **Reset ke Data Awal** → konfirmasi → kembali menjadi 8 kostum dengan nilai persis seperti tabel 4.6 (termasuk status & stok awal) setelah refresh.

### F. Kualitas Umum
- [ ] **F1** Uji di viewport mobile (~375px): kartu 1 kolom, tidak ada horizontal scroll di halaman utama, modal masih bisa dibaca & ditutup.
- [ ] **F2** Uji di viewport desktop (~1280px): kartu tampil 3–4 kolom, dashboard rapi.
- [ ] **F3** Buka DevTools → Console: **tidak ada error/warning** saat menjalankan alur A–E.
- [ ] **F4** Simulasikan localStorage mati (devtools/private mode): aplikasi tidak crash, muncul toast peringatan, dan masih bisa dipakai selama sesi.
- [ ] **F5** Memasukkan `<img src=x onerror=alert(1)>` ke field nama saat tambah kostum → teks tampil apa adanya sebagai string, **tidak** mengeksekusi script.

---

## 9. Implementation Plan per Iterasi

> Prinsip: setiap iterasi menghasilkan aplikasi yang **bisa dijalankan**. Uji acceptance poin terkait di akhir tiap iterasi sebelum lanjut. Cocok untuk dibimbing (vibe coding) satu prompt per iterasi.

### Iterasi 0 — Fondasi Proyek ⏱ ~10 menit
**Tujuan:** Skeleton Vite + Tailwind yang siap dipakai.
- Inisialisasi Vite (vanilla JS), pasang & konfigurasi Tailwind via PostCSS.
- Buat struktur folder sesuai 5.1, `index.html` dengan container utama + 2 tab: **Katalog** dan **Dashboard**.
- Tambah konstanta global di `src/data/seed.js`: `KATEGORI`, `UKURAN`, `STATUS`, `WHATSAPP_NUMBER`.
- **Verifikasi:** `npm run dev` membuka halaman kosong bertema Tailwind, tab bisa diklik, Console bersih.
- **AC terkait:** F3 (parsial).

### Iterasi 1 — Data, Model & Penyimpanan ⏱ ~15 menit
**Tujuan:** 8 seed + localStorage + statistik.
- Tulis 8 objek seed (tabel 4.6) dengan `deskripsi` bahasa Indonesia.
- Implementasi `storage.js`: `loadKostum()`, `saveKostum()`, `resetKostum()` dengan `try/catch` + auto-reseed.
- Implementasi `utils.js`: `formatRupiah`, `clamp`, `uuid` (dengan fallback), `hitungSewa`, `escapeHtml`.
- Buat kartu statistik di Dashboard dengan rumus 4.3.
- Buat 8 file `kostum-0X.svg` sederhana + `placeholder.svg` di `public/images`.
- **Verifikasi:** Refresh berkali-kali → data tidak berubah; angka statistik = 8 / 17 / 1.
- **AC terkait:** A1–A4, E1, NFR3, NFR4, R1.

### Iterasi 2 — Katalog: Search, Filter & Sort ⏱ ~20 menit
**Tujuan:** Penyewa bisa menemukan kostum.
- Render kartu dari array (gambar + `alt` + `onerror` fallback, metadata, badge status, badge unggulan).
- Implementasi pipeline: `pencarian` → `filter` → `sort` (F1.4–F1.6, R11).
- Empty state + tombol **Hapus Filter** (F1.7).
- Pasang warna badge konsisten dari satu konstanta (NFR8).
- **Verifikasi:** Jalankan AC B1–B10.
- **AC terkait:** B1–B10, A2, NFR1, NFR5.

### Iterasi 3 — Detail Modal, Kalkulator & WhatsApp ⏱ ~25 menit
**Tujuan:** Inti nilai aplikasi: estimasi biaya + pesan otomatis.
- Bangun modal detail (semua metadata + deskripsi + 3 cara tutup + focus management).
- Pasang input tanggal (`min` = hari ini) dan durasi (`min=2`, `max=30`, stepper −/+).
- Pasang `hitungSewa()` → tampilkan rincian + total Rupiah (F2.4, 4.4).
- Pasang tombol WA: nonaktif sesuai F2.8; buat pesan sesuai 4.5; buka `wa.me` dengan `encodeURIComponent`.
- Tambah checkbox simulasi sewa + jalankan Aturan 4.4 jalur ke-2 (F2.7).
- **Verifikasi:** Jalankan AC C1–C8 dan D1–D4.
- **AC terkait:** C1–C8, D1–D4, NFR6, NFR7, NFR9.

### Iterasi 4 — Dashboard CRUD & Reset ⏱ ~25 menit
**Tujuan:** Pengelola bisa mengelola katalog.
- Modal form Tambah/Edit dengan validasi 4.2 (error inline, fokus ke field pertama error).
- Status select cepat di daftar/table + penyimpanan instan (F3.4).
- Hapus + `window.confirm` (F3.5).
- Tombol **Reset ke Data Awal** + `window.confirm` + render ulang seluruh tampilan (F3.6).
- Pastikan statistik (Iterasi 1) ikut ter-refresh setelah setiap mutasi.
- **Verifikasi:** Jalankan AC E2–E7.
- **AC terkait:** E2–E7, F5, R3, R5, R7.

### Iterasi 5 — Finishing, Responsif & UAT ⏱ ~15 menit
**Tujuan:** Siap dipakai & memenuhi NFR.
- Rapikan breakpoint Tailwind (mobile/tablet/desktop), cek tidak ada horizontal scroll.
- Tambah toast untuk kegagalan localStorage & notifikasi aksi berhasil (simpan/hapus/reset).
- Cek kontras, label, `alt`, focus ring, dan urutan tab keyboard.
- Jalankan **seluruh** Acceptance Criteria Bagian 8 dari A1 sampai F5.
- Perbaiki temuan; pastikan Console bersih.
- **Verifikasi:** Checklist 8 lengkap ✅.
- **AC terkait:** F1–F5, seluruh NFR.

### 9.1 Urutan Prompt Vibe Coding (Ringkas, copy-paste)
1. `Buat skeleton Vite + Vanilla JS + Tailwind untuk Costestant dengan 2 tab: Katalog dan Dashboard. Sertakan konstanta enum KATEGORI, UKURAN, STATUS dan WHATSAPP_NUMBER = '6281234567890' (placeholder). Rujuk SPEC.md Bagian 5.1 dan 4.6.`
2. `Implementasikan data seed 8 kostum dan modul storage.js + utils.js sesuai SPEC.md Bagian 4.1, 4.2, 4.6, 4.7. Tampilkan 3 kartu statistik dengan rumus Bagian 4.3.`
3. `Buat rendering kartu katalog beserta pencarian, filter, sorting, dan empty state sesuai SPEC.md F1.1–F1.8 serta AC B1–B10.`
4. `Buat modal detail dengan kalkulator sewa dan tombol Sewa via WhatsApp sesuai SPEC.md F2.1–F2.8, 4.4, 4.5. Jangan lupa simulasi sewa dan validasi durasi.`
5. `Buat Dashboard CRUD lengkap dengan validasi form, ubah status cepat, hapus, dan reset sesuai SPEC.md F3.1–F3.8, 4.2, 4.7 serta AC E2–E7.`
6. `Rapikan responsivitas, aksesibilitas, toast, dan jalankan seluruh Acceptance Criteria di SPEC.md Bagian 8. Perbaiki semua yang belum ✅.`

---

### Penutup
Dokumen ini adalah **sumber kebenaran tunggal** untuk implementasi. Jika ada konflik antara kode dan spesifikasi, **spesifikasi yang menang**, kecuali perubahan disetujui dan dicatat sebagai revisi dokumen ini (naikkan nomor versi di header).

**Dilarang** menambahkan fitur di luar Bagian 7 selama target 1 hari ini.
