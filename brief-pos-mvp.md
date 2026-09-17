# Brief Teknis — Sistem POS UMKM (MVP Fase 1)

> Dokumen ini adalah spesifikasi kerja untuk AI coding agent.
> Baca seluruhnya sebelum menulis kode. Bagian **Aturan Tidak Bisa Ditawar**
> dan **Di Luar Lingkup** adalah batasan keras, bukan saran.

---

## 1. Konteks Produk

Aplikasi Point of Sale (POS) berbasis SaaS untuk UMKM mikro di Indonesia,
segmen F&B (kedai kopi, warung makan) dan retail kecil (toko kelontong,
toko baju). Target awal: merchant satu outlet dengan 1–2 perangkat kasir.

Kondisi lapangan yang menentukan seluruh desain teknis:

- Koneksi internet di lokasi merchant **tidak dapat diandalkan**. Kasir wajib
  tetap melayani transaksi penuh saat internet mati total.
- Perangkat kasir adalah **tablet Android murah** (RAM 2–4 GB, Android 10+).
- Printer struk adalah **printer thermal 58mm Bluetooth Classic (SPP)**,
  bukan BLE. Ini alasan utama aplikasi kasir dibungkus native, bukan web murni.
- Developer berlatar belakang web (React, TypeScript, Next.js, Supabase/Postgres).
  Stack dipilih untuk meminimalkan teknologi baru yang harus dipelajari.

---

## 2. Lingkup MVP Fase 1

### Yang dibangun

| # | Fitur | Keterangan |
|---|-------|------------|
| 1 | Autentikasi | Login merchant + login kasir (PIN) |
| 2 | Katalog produk | Produk, kategori, varian sederhana, harga |
| 3 | Kasir offline-first | Keranjang, diskon per item & per transaksi, pembayaran tunai & QRIS statis |
| 4 | Cetak struk | ESC/POS ke printer thermal 58mm Bluetooth |
| 5 | Shift kasir | Buka kas, tutup kas, perhitungan selisih |
| 6 | Sinkronisasi | Outbox background sync, idempoten, tahan putus koneksi |
| 7 | Backoffice web | CRUD produk, daftar transaksi, laporan penjualan harian |

### Di Luar Lingkup (JANGAN dibangun)

Jangan menambahkan ini walaupun terlihat mudah atau "sekalian saja":

- Manajemen stok & inventory (fase 2 — tapi lihat catatan §5.3)
- Resep/BOM, multi-gudang, purchase order
- Loyalty, membership, poin, voucher
- Multi-outlet, transfer antar cabang
- Absensi karyawan, payroll
- Akuntansi, jurnal, laporan keuangan, faktur pajak
- Integrasi payment gateway / QRIS dinamis
- Table management, kitchen display
- Integrasi GoFood / GrabFood / marketplace
- Billing langganan SaaS
- Aplikasi iOS

QRIS pada MVP ini **hanya pencatatan metode pembayaran**. Kasir menandai
transaksi dibayar via QRIS, sistem mencatatnya. Tidak ada verifikasi otomatis,
tidak ada webhook, tidak ada generate QR.

---

## 3. Arsitektur & Stack

Monorepo pnpm workspace:

```
pos/
├── apps/
│   ├── kasir/        # Vite + React + TS, dibungkus Capacitor → APK Android
│   └── backoffice/   # Next.js (App Router) + TS
├── packages/
│   └── core/         # Logika bersama: tipe, kalkulasi, validasi, ESC/POS
└── supabase/
    └── migrations/   # SQL migration
```

**apps/kasir**
- Vite + React 18 + TypeScript, **SPA murni** (bukan SSR)
- SQLite lokal via `@capacitor-community/sqlite`
- Bluetooth Classic via plugin Capacitor untuk printer
- State: Zustand (ringan, cukup untuk skala ini)

**apps/backoffice**
- Next.js App Router + TypeScript
- Tailwind + komponen sederhana
- Akses Supabase langsung dengan RLS

**packages/core**
- Definisi tipe TypeScript untuk seluruh entitas
- Fungsi kalkulasi total transaksi (harga, diskon, pembulatan)
- Builder perintah ESC/POS
- **Wajib**: perhitungan total hanya boleh ada di sini, dipakai kasir dan
  backoffice. Jangan duplikasi logika harga.

**Backend**
- Supabase (Postgres + Auth + RLS)
- Endpoint sync sebagai Supabase Edge Function

---

## 4. Aturan Tidak Bisa Ditawar

Enam aturan berikut menentukan apakah sistem ini bisa hidup. Melanggar salah
satunya berarti harus tulis ulang nanti. Kalau ada instruksi lain di dokumen ini
yang tampak bertentangan dengan bagian ini, bagian ini yang menang.

### 4.1 ID digenerate di client

Seluruh primary key memakai **UUIDv7 yang dibuat di perangkat kasir**, bukan
`bigserial` atau `gen_random_uuid()` di Postgres. Perangkat offline harus bisa
membuat ID yang dijamin unik tanpa bertanya ke server.

UUIDv7 dipilih karena terurut berdasarkan waktu, jadi indeks Postgres tetap
efisien. Gunakan library yang sudah ada, jangan implementasi sendiri.

### 4.2 Outbox pattern

Alur penyimpanan transaksi:

```
Kasir tekan "Bayar"
  → tulis ke SQLite lokal (transaksi + item)   [sinkron, wajib sukses]
  → masukkan ke tabel outbox                    [sinkron]
  → cetak struk                                 [sinkron]
  → UI kembali ke layar kasir                   ← SELESAI dari sisi user
  
  ... terpisah, di background:
  → worker baca outbox → kirim ke server → tandai terkirim
```

UI **tidak pernah menunggu jaringan**. Tidak ada spinner "menyimpan
transaksi..." yang menunggu response HTTP. Kalau agent menulis `await
fetch(...)` di jalur pembayaran, itu salah.

### 4.3 Idempotensi

Setiap transaksi membawa `id` (UUIDv7 dari client). Server melakukan:

```sql
INSERT INTO transaksi (...) VALUES (...)
ON CONFLICT (id) DO NOTHING;
```

Retry karena timeout tidak boleh menggandakan penjualan. Ini kegagalan paling
merusak kepercayaan merchant, jadi harus ada test khusus untuknya.

### 4.4 Stok sebagai ledger, bukan angka

Walaupun modul inventory di luar lingkup MVP, **struktur datanya disiapkan
sekarang** karena tidak bisa diubah belakangan tanpa migrasi menyakitkan.

Jangan pernah membuat kolom `produk.stok INTEGER` yang di-`UPDATE`. Stok
direpresentasikan sebagai baris pergerakan yang hanya bisa ditambah:

```
stok_saat_ini = SUM(pergerakan_stok.qty WHERE produk_id = ?)
```

Alasannya: dua perangkat offline yang menjual produk sama tidak akan bentrok
saat sync — keduanya hanya menyisipkan baris baru, dan jumlahnya tetap benar.
Kalau stok disimpan sebagai angka yang di-update, sync akan saling menimpa dan
angka stok jadi salah tanpa jejak.

Oversell (stok jadi minus) **diterima sebagai perilaku normal**, bukan error
yang harus dicegah. Jangan tambahkan pengecekan yang memblokir penjualan.

### 4.5 Data master satu arah

Produk, kategori, dan harga mengalir **server → perangkat saja**. Perangkat
kasir tidak pernah mengubah data master. Editing produk hanya di backoffice.

Setiap tabel master punya kolom `updated_at`. Perangkat melakukan pull
inkremental: minta baris dengan `updated_at > terakhir_disinkronkan`.

Aturan ini menghilangkan hampir semua kemungkinan konflik data.

### 4.6 Nomor struk diberi prefix perangkat

Format: `{kode_device}-{counter}` → `K1-000123`, `K2-000123`.

Counter bersifat lokal per perangkat. Jangan pakai counter global dari server.

---

## 5. Skema Database

### 5.1 Postgres (server)

```sql
create table merchant (
  id            uuid primary key,
  nama          text not null,
  created_at    timestamptz not null default now()
);

create table device (
  id            uuid primary key,
  merchant_id   uuid not null references merchant(id),
  kode          text not null,              -- 'K1', 'K2'
  nama          text not null,
  last_sync_at  timestamptz,
  unique (merchant_id, kode)
);

create table pengguna (
  id            uuid primary key,
  merchant_id   uuid not null references merchant(id),
  nama          text not null,
  pin_hash      text not null,
  peran         text not null,              -- 'owner' | 'kasir'
  aktif         boolean not null default true
);

create table kategori (
  id            uuid primary key,
  merchant_id   uuid not null references merchant(id),
  nama          text not null,
  urutan        int not null default 0,
  updated_at    timestamptz not null default now(),
  deleted_at    timestamptz
);

create table produk (
  id            uuid primary key,
  merchant_id   uuid not null references merchant(id),
  kategori_id   uuid references kategori(id),
  nama          text not null,
  sku           text,
  harga         bigint not null,            -- RUPIAH, INTEGER. Lihat catatan.
  lacak_stok    boolean not null default false,
  updated_at    timestamptz not null default now(),
  deleted_at    timestamptz
);

create table varian (
  id            uuid primary key,
  produk_id     uuid not null references produk(id),
  nama          text not null,              -- 'Panas', 'Dingin', 'L'
  selisih_harga bigint not null default 0,
  updated_at    timestamptz not null default now(),
  deleted_at    timestamptz
);

create table shift (
  id            uuid primary key,
  merchant_id   uuid not null references merchant(id),
  device_id     uuid not null references device(id),
  pengguna_id   uuid not null references pengguna(id),
  dibuka_pada   timestamptz not null,
  ditutup_pada  timestamptz,
  kas_awal      bigint not null,
  kas_akhir     bigint,                     -- hasil hitung fisik
  selisih       bigint                      -- kas_akhir - ekspektasi
);

create table transaksi (
  id                uuid primary key,       -- UUIDv7 dari client
  merchant_id       uuid not null references merchant(id),
  device_id         uuid not null references device(id),
  shift_id          uuid not null references shift(id),
  pengguna_id       uuid not null references pengguna(id),
  nomor_struk       text not null,          -- 'K1-000123'
  subtotal          bigint not null,
  diskon            bigint not null default 0,
  total             bigint not null,
  metode_bayar      text not null,          -- 'tunai' | 'qris'
  dibayar           bigint not null,
  kembalian         bigint not null default 0,
  status            text not null default 'selesai',  -- 'selesai' | 'void'
  waktu_client      timestamptz not null,   -- jam perangkat kasir
  waktu_server      timestamptz not null default now(),
  unique (device_id, nomor_struk)
);

create table transaksi_item (
  id            uuid primary key,
  transaksi_id  uuid not null references transaksi(id) on delete cascade,
  produk_id     uuid not null,
  varian_id     uuid,
  nama_produk   text not null,              -- SNAPSHOT, lihat catatan
  harga_satuan  bigint not null,            -- SNAPSHOT
  qty           int not null,
  diskon        bigint not null default 0,
  subtotal      bigint not null
);

-- Disiapkan untuk fase 2, sudah dipakai sejak MVP untuk produk ber-lacak_stok
create table pergerakan_stok (
  id            uuid primary key,
  merchant_id   uuid not null references merchant(id),
  produk_id     uuid not null references produk(id),
  varian_id     uuid,
  qty           int not null,               -- negatif = keluar
  tipe          text not null,              -- 'penjualan' | 'penyesuaian' | 'awal'
  ref_id        uuid,                       -- transaksi_id bila tipe penjualan
  waktu_client  timestamptz not null,
  waktu_server  timestamptz not null default now()
);
```

**Catatan penting soal skema:**

- **Uang disimpan sebagai `bigint` dalam satuan rupiah penuh.** Jangan pakai
  `float`, `double`, atau `numeric` dengan desimal. Rupiah tidak punya sen yang
  dipakai di ritel. Di TypeScript gunakan `number` (aman sampai 9 kuadriliun).
- **`transaksi_item` menyimpan snapshot nama dan harga.** Struk dari 3 bulan
  lalu harus tetap menampilkan harga saat itu, bukan harga sekarang. Jangan
  ganti dengan JOIN ke tabel produk.
- **Soft delete** (`deleted_at`) untuk data master, karena transaksi lama
  mereferensikannya.
- `waktu_client` dan `waktu_server` dipisah karena jam tablet murah sering
  meleset. Laporan memakai `waktu_client` (itu jam yang dirasakan kasir),
  audit memakai `waktu_server`.

### 5.2 SQLite (perangkat kasir)

Cerminkan skema Postgres di atas dengan penyesuaian:

- `uuid` → `TEXT`
- `timestamptz` → `TEXT` (ISO 8601 UTC)
- `bigint` → `INTEGER`
- `boolean` → `INTEGER` (0/1)

Tambahkan dua tabel khusus perangkat:

```sql
create table outbox (
  id            TEXT primary key,
  tabel         TEXT not null,      -- 'transaksi' | 'shift' | 'pergerakan_stok'
  record_id     TEXT not null,
  payload       TEXT not null,      -- JSON
  percobaan     INTEGER not null default 0,
  error_terakhir TEXT,
  dibuat_pada   TEXT not null,
  terkirim_pada TEXT                -- NULL = belum terkirim
);

create table sync_state (
  tabel              TEXT primary key,
  terakhir_ditarik   TEXT           -- updated_at terakhir yang sudah di-pull
);
```

### 5.3 Catatan soal stok di MVP

Modul inventory tidak dibangun, tapi tabel `pergerakan_stok` **sudah aktif**.
Untuk produk dengan `lacak_stok = true`, setiap transaksi otomatis menyisipkan
baris pergerakan negatif. Backoffice belum menampilkan apa pun soal stok.

Tujuannya: saat fase 2 dimulai, datanya sudah terkumpul dan tidak perlu migrasi.

---

## 6. Alur Sinkronisasi

### Push (perangkat → server)

1. Worker berjalan tiap 15 detik dan saat koneksi kembali tersedia
2. Ambil hingga 50 baris outbox dengan `terkirim_pada IS NULL`, urut lama→baru
3. POST batch ke Edge Function `/sync/push`
4. Server: `INSERT ... ON CONFLICT (id) DO NOTHING` per record, dalam satu transaksi
5. Server balas daftar `id` yang diterima
6. Perangkat tandai `terkirim_pada` untuk id tersebut
7. Gagal → naikkan `percobaan`, backoff eksponensial (maks 5 menit), jangan hapus

Baris outbox yang gagal **tidak pernah dibuang otomatis**. Kalau `percobaan > 10`,
tampilkan peringatan di UI kasir agar merchant tahu ada data belum tersimpan.

### Pull (server → perangkat)

1. Saat aplikasi dibuka dan tiap 5 menit saat online
2. Untuk tiap tabel master: GET `/sync/pull?tabel=produk&sejak={terakhir_ditarik}`
3. Upsert hasilnya ke SQLite
4. Perbarui `sync_state.terakhir_ditarik`

### Indikator status di UI kasir

Wajib ada, kecil di pojok atas:

- Hijau: tersinkron, semua data aman
- Kuning: ada N transaksi menunggu kirim (normal saat offline)
- Merah: sync gagal berulang, butuh perhatian

Jangan pernah memblokir kasir karena status sync. Indikator bersifat informatif.

---

## 7. Cetak Struk (ESC/POS)

Target: printer thermal 58mm, lebar cetak **32 karakter** font A.

Perintah dasar yang dibutuhkan:

| Fungsi | Byte |
|--------|------|
| Inisialisasi | `1B 40` |
| Rata tengah / kiri | `1B 61 01` / `1B 61 00` |
| Tebal on / off | `1B 45 01` / `1B 45 00` |
| Ukuran ganda | `1D 21 11` |
| Feed & potong | `1D 56 42 00` |
| Buka laci kas | `1B 70 00 19 FA` |

Implementasi builder-nya di `packages/core` sebagai fungsi murni yang
mengembalikan `Uint8Array`, sehingga bisa di-unit-test tanpa printer fisik.

Layout struk:

```
       NAMA MERCHANT
      Alamat merchant
--------------------------------
No  : K1-000123
Tgl : 15/09/2026 14:32
Kasir: Desia
--------------------------------
Kopi Susu (Dingin)
  2 x 18.000           36.000
Roti Bakar
  1 x 15.000           15.000
--------------------------------
Subtotal               51.000
Diskon                 -5.000
TOTAL                  46.000
Tunai                  50.000
Kembali                 4.000
--------------------------------
        Terima kasih
```

**Penting:** cetak struk tidak boleh menggagalkan transaksi. Kalau printer
tidak terhubung atau kehabisan kertas, transaksi tetap tersimpan dan UI
menawarkan tombol "Cetak ulang". Jangan pasang `throw` yang membatalkan
penyimpanan.

---

## 8. Kriteria Penerimaan

Setiap poin harus bisa didemonstrasikan. Tulis test otomatis untuk yang bertanda (T).

**Offline**
1. Matikan seluruh koneksi. Lakukan 20 transaksi. Semua tersimpan dan tercetak.
2. Nyalakan koneksi. Dalam 60 detik seluruh 20 transaksi muncul di backoffice.
3. Tutup paksa aplikasi di tengah transaksi. Buka lagi — data tidak korup,
   transaksi yang belum selesai tidak tersimpan setengah jadi.

**Idempotensi (T)**
4. Kirim payload sync yang sama tiga kali. Server tetap punya satu baris.
5. Simulasikan timeout setelah server menyimpan tapi sebelum respons sampai.
   Setelah retry, tidak ada duplikat.

**Konkurensi (T)**
6. Dua perangkat offline masing-masing menjual 5 unit produk yang sama.
   Setelah keduanya sync, `SUM(pergerakan_stok.qty)` = -10. Tidak ada yang hilang.

**Nomor struk (T)**
7. Dua perangkat membuat transaksi bersamaan secara offline. Tidak ada
   pelanggaran constraint `unique (device_id, nomor_struk)` saat sync.

**Kalkulasi (T)**
8. Total transaksi dengan kombinasi diskon item + diskon transaksi dihitung
   identik di `packages/core` dan di backoffice.

**Shift**
9. Tutup shift dengan kas fisik berbeda dari ekspektasi. Selisih tercatat benar.

**Performa**
10. Katalog 500 produk. Pencarian produk merespons di bawah 200ms di tablet
    RAM 2GB.
11. Dari tekan "Bayar" sampai UI siap transaksi berikutnya: di bawah 1 detik
    (tidak termasuk waktu cetak).

---

## 9. Urutan Pengerjaan

Kerjakan berurutan. Jangan lompat. Setiap tahap harus jalan sebelum lanjut.

1. **Setup monorepo** — pnpm workspace, TypeScript config bersama, struktur folder
2. **`packages/core`** — tipe entitas, fungsi kalkulasi total, unit test kalkulasi
3. **Migration Postgres** — skema §5.1 + RLS per `merchant_id`
4. **Backoffice minimal** — auth, CRUD produk & kategori
5. **Shell aplikasi kasir** — Vite + React + Capacitor, build APK berhasil jalan
6. **SQLite lokal** — skema §5.2, layer akses data, seed data dummy
7. **Layar kasir** — katalog, keranjang, diskon, pembayaran, simpan ke SQLite
8. **Cetak ESC/POS** — builder di core, integrasi Bluetooth, uji di printer nyata
9. **Shift kasir** — buka/tutup, perhitungan selisih
10. **Outbox & push sync** — worker, batch, retry, Edge Function
11. **Pull sync** — master data inkremental
12. **Indikator status sync** di UI kasir
13. **Laporan penjualan harian** di backoffice
14. **Uji kriteria penerimaan §8** satu per satu

Setelah tahap 5, 8, dan 10 — berhenti dan minta review sebelum lanjut.
Ketiganya adalah titik yang paling mahal kalau arahnya salah.

---

## 10. Konvensi

- Nama tabel, kolom, dan field domain: **bahasa Indonesia** (`transaksi`,
  `nomor_struk`, `metode_bayar`)
- Nama fungsi, variabel teknis, dan istilah programming: **bahasa Inggris**
  (`syncOutbox`, `buildReceipt`, `useCartStore`)
- Komentar kode: bahasa Indonesia
- TypeScript `strict: true`. Dilarang `any` kecuali di boundary parsing JSON,
  dan di situ wajib divalidasi dengan Zod.
- Commit message: Conventional Commits

---

## 11. Yang Tidak Boleh Dilakukan

Daftar ini ada karena setiap poinnya adalah kesalahan yang mudah terjadi dan
mahal diperbaiki:

- ❌ Memakai Next.js untuk aplikasi kasir. Harus Vite SPA murni.
- ❌ `await fetch()` di jalur penyimpanan transaksi.
- ❌ Auto-increment atau `gen_random_uuid()` di server untuk ID transaksi.
- ❌ Kolom `stok` yang di-`UPDATE`.
- ❌ Memblokir penjualan karena stok tidak cukup.
- ❌ Tipe desimal/float untuk nilai uang.
- ❌ JOIN ke tabel produk untuk menampilkan nama/harga di struk lama.
- ❌ Menghapus baris outbox yang gagal terkirim.
- ❌ Menambah fitur dari daftar "Di Luar Lingkup" §2.
- ❌ Web Bluetooth API untuk printer. Harus plugin Capacitor (Bluetooth Classic
  SPP), karena Web Bluetooth hanya mendukung BLE.

---

## 12. Yang Perlu Dikonfirmasi Sebelum Mulai

Kalau ada yang tidak jelas di bawah ini, tanyakan dulu — jangan mengasumsikan:

1. Plugin Capacitor mana yang dipilih untuk Bluetooth Classic SPP (perlu
   verifikasi plugin yang masih aktif dipelihara)
2. Apakah pembulatan total ke Rp100 terdekat diperlukan
3. Perilaku saat shift belum dibuka tapi kasir mencoba transaksi
4. Apakah void transaksi perlu ada di MVP atau cukup cetak ulang
