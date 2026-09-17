# Panduan & Aturan AI untuk Sistem POS "Diko" (Digital Toko)

> **DOKUMEN INI WAJIB DIBACA DAN DIPATUHI OLEH SETIAP MODEL / AGENT AI YANG BEKERJA PADA REPOSITORY INI.**
> Bagian **Aturan Tidak Bisa Ditawar** dan **Di Luar Lingkup** adalah batasan keras (*hard constraints*), bukan saran. Pelanggaran terhadap aturan ini akan merusak arsitektur offline-first dan integritas data merchant.

---

## 1. Identitas & Visi Produk

- **Nama Produk**: **Diko (Digital Toko)**
- **Tagline**: *Sistem Kasir Digital Cepat, Andal, & Offline-First untuk UMKM*
- **Karakteristik Utama**: 
  - Dirancang untuk UMKM mikro di Indonesia (F&B: kedai kopi, warung makan; Retail: toko kelontong, butik pakaian).
  - Beroperasi penuh secara **Offline-First** (koneksi internet di Indonesia sering putus/mati total).
  - Target perangkat utama: **Tablet Android / iPad (Touchscreen)** dan **Laptop / Komputer Kasir (Keyboard & Mouse)**.
  - Printer kasir: **Thermal 58mm Bluetooth Classic (SPP)** dengan lebar cetak **32 karakter**.

---

## 2. Aturan Tidak Bisa Ditawar (Non-Negotiable Core Rules)

Sembilan aturan ini menentukan kelangsungan hidup arsitektur sistem. Dilarang mengubah atau melanggar aturan-aturan ini:

### 2.1 ID Selalu Digenerate di Client (UUIDv7)
- Seluruh primary key (`transaksi`, `shift`, `transaksi_item`, `outbox`) wajib memakai **UUIDv7 yang dibuat langsung di perangkat kasir**, bukan `bigserial` atau `gen_random_uuid()` di server Postgres.
- Perangkat offline harus bisa membuat ID unik secara mandiri tanpa bergantung ke server.
- UUIDv7 dipilih karena terurut secara kronologis (time-ordered), menjaga efisiensi indeks Postgres.

### 2.2 Outbox Pattern (Dilarang Keras `await fetch()` di Alur Kasir)
- Alur penyimpanan transaksi kasir:
  1. Kasir tekan **"Bayar"**
  2. Tulis ke SQLite lokal (transaksi + item) — *sinkron, wajib sukses*
  3. Masukkan ke tabel outbox lokal — *sinkron*
  4. Cetak struk / tampilkan receipt — *sinkron*
  5. UI kembali siap untuk transaksi berikutnya — *SELESAI dari sisi kasir (< 1 detik)*
  6. Terpisah di background worker: baca outbox $\to$ kirim ke server $\to$ tandai terkirim.
- **UI KASIR TIDAK PERNAH MENUNGGU JARINGAN**. Jika ada model yang menulis `await fetch(...)` atau `await supabase...` di dalam alur tombol bayar/checkout, **itu adalah kesalahan fatal**.

### 2.3 Idempotensi Server
- Setiap pengiriman data transaksi ke server wajib membawa ID client dan ditangani dengan:
  ```sql
  INSERT INTO transaksi (...) VALUES (...)
  ON CONFLICT (id) DO NOTHING;
  ```
- Percobaan sync ulang (*retry*) karena timeout jaringan **tidak boleh menggandakan data penjualan**.

### 2.4 Stok adalah Ledger, Bukan Angka yang Di-Update
- **Dilarang membuat kolom `produk.stok INTEGER` yang di-`UPDATE`**.
- Stok dicatat sebagai baris pergerakan (*append-only ledger*) di tabel `pergerakan_stok`:
  ```
  stok_saat_ini = SUM(pergerakan_stok.qty WHERE produk_id = ?)
  ```
- Dua kasir offline yang menjual barang yang sama tidak akan konflik saat sinkronisasi; keduanya hanya menambah baris pergerakan negatif.
- **Oversell (stok minus) adalah perilaku normal yang diterima**, BUKAN error. **Dilarang memblokir kasir untuk menjual barang hanya karena stok di sistem habis/minus**.

### 2.5 Master Data Mengalir Satu Arah (Server $\to$ Kasir)
- Produk, kategori, harga, dan varian mengalir **hanya dari Server $\to$ Kasir**.
- Aplikasi kasir tidak pernah mengubah atau mengedit data master produk. Pengelolaan katalog hanya dilakukan di Backoffice web.
- Sinkronisasi master data dilakukan secara inkremental melalui kolom `updated_at`.

### 2.6 Format Nomor Struk Ber-Prefix Perangkat
- Format: `{kode_device}-{counter}` $\to$ contoh: `D1-000123`, `D2-000123`.
- Nomor counter dikelola secara lokal per perangkat kasir. Tidak menggunakan counter global dari server agar kasir offline tetap dapat menerbitkan nomor struk unik.

### 2.7 Nilai Uang Disimpan Sebagai Integer Rupiah
- Uang disimpan dalam satuan Rupiah penuh (`bigint` di Postgres, `INTEGER` di SQLite, `number` di TypeScript).
- **Dilarang menggunakan `float`, `double`, atau tipe desimal bersen**.

### 2.8 Cetak Struk ESC/POS 58mm Murni & Toleran Kesalahan
- Layout struk diformat untuk printer thermal 58mm dengan lebar **32 karakter**.
- Builder struk diimplementasikan di `packages/core` sebagai fungsi murni yang mengembalikan `Uint8Array`.
- **Kegagalan printer (mati/habis kertas/putus koneksi) TIDAK BOLEH menggagalkan penyimpanan transaksi**.

### 2.9 Pemisahan Aplikasi: Vite SPA (Kasir) vs Next.js (Backoffice)
- **`apps/kasir`**: Wajib menggunakan **Vite + React 18 + TypeScript SPA murni** (agar dapat dibungkus Capacitor menjadi APK Android & berjalan offline). **Dilarang memakai Next.js di apps/kasir**.
- **`apps/backoffice`**: Next.js App Router untuk admin web merchant.

---

## 3. Batasan Lingkup MVP (Di Luar Lingkup — JANGAN DIBANGUN)

Dilarang keras menambahkan fitur-fitur berikut meskipun terlihat mudah:
- ❌ Modul manajemen stok & inventory gudang bertingkat (fase 2)
- ❌ Resep/BOM (Bill of Materials), multi-gudang, purchase order (PO)
- ❌ Sistem loyalty poin, member tier, kupon/voucher bertingkat
- ❌ Multi-outlet & transfer antar cabang
- ❌ Absensi karyawan, penggajian (payroll)
- ❌ Akuntansi double-entry, jurnal buku besar, faktur pajak
- ❌ Integrasi dinamis payment gateway otomatis / generate QR dinamis (QRIS di MVP adalah **pencatatan manual**)
- ❌ Table management & Kitchen Display System (KDS)
- ❌ Integrasi pesanan GoFood / GrabFood / ShopeeFood
- ❌ Aplikasi native iOS

---

## 4. Standar Desain UI/UX Diko (Anti AI-Slop)

Antarmuka Diko harus tampil seperti perangkat lunak kasir komersial kelas atas (sekelas Square, Toast, Olsera) yang fungsional, taktil, dan elegan:

1. **Optimasi Dua Mode Perangkat**:
   - **Tablet / iPad (Touchscreen)**:
     - Target sentuh (*touch target*) minimal **48px $\times$ 48px** untuk seluruh tombol interaktif.
     - Jarak antar tombol minimal **8px**.
     - Numpad virtual berukuran besar, responsif, dan mudah ditekan ibu jari/jari kasir.
     - Panel keranjang belanja di sisi kanan yang mudah dijangkau satu tangan.
   - **Laptop / Komputer (Keyboard & Mouse)**:
     - Dukungan tombol pintas (*keyboard shortcuts*):
       - `/` atau `F2`: Fokus pencarian produk
       - `Esc`: Batalkan pencarian / tutup modal aktif
       - `Space` / `Enter`: Buka modal pembayaran / konfirmasi
     - Grid katalog adaptif (otomatis menyesuaikan 3–5 kolom berdasarkan lebar layar).
2. **Kesesuaian Warna & Kontras (Palet Enamel, Kertas, & Status)**:
   - Warna Merek & Teks Utama: Enamel 900 `#16343A`
   - Aksi Utama (Satu per layar): Enamel 600 `#205C68` (Tombol Bayar/Checkout)
   - Aksen & Chip/Badge: Enamel 100 `#D9E7E9` / Enamel 400 `#6C9DA4`
   - Latar Netral: Kertas `#FFFFFF` & Latar `#FAFAF8`, Garis Pembatas `#E4E1DA`
   - **Filosofi Status (Hanya dua warna status, bukan tiga)**:
     - Tersimpan: Kondisi normal / tidak berteriak (`teks-2` `#6B675E` + ikon centang)
     - Menunggu kirim: Amber hangat `#A06A1B` (butuh perhatian ringan)
     - Gagal: Terracotta Red `#B8504B` (butuh tindakan segera)
   - Rasio kontras teks minimal 4.5:1 terhadap background.
3. **Tipografi Modern**:
   - Font: `Plus Jakarta Sans` / `Inter`
   - Tampilan angka harga & kalkulasi menggunakan angka tabular / mono agar digit rupiah lurus rapi saat dijumlahkan.
4. **Bebas AI-Slop & Standar Ikonografi**:
   - **Dilarang Keras Memakai Emoji/Emoticon Sebagai Ikon Antarmuka** (misal 🍔, ☕, 💵, 📱, 🍟, ✕, 🗑️). Penggunaan emoji merusak citra profesionalitas sistem.
   - **Wajib Menggunakan Library `lucide-react`**: Seluruh ikon tombol, kategori, navigasi, dan status wajib menggunakan komponen SVG murni dari `lucide-react` dengan ukuran dan stroke konsisten (`strokeWidth={2}`).
   - **Fokus Tampilan Mobile & Grid Rapi**: Tampilan layar sempit/mobile harus responsif penuh dengan bottom bar / floating cart drawer, grid kartu produk 2 kolom yang presisi, dan kartu produk yang teratur rapi.
   - Efek transisi cepat dan taktil (150ms–200ms `ease-out`), mikro-interaksi klik terasa mantap (`active:scale-[0.98]`).
   - Indikator sync outbox informatif mengikuti filosofi 2 warna status tanpa pernah memblokir layar kasir.

---

## 5. Konvensi Kode & Bahasa

- **Nama Domain & Database**: Bahasa Indonesia (`transaksi`, `produk`, `nomor_struk`, `metode_bayar`).
- **Nama Fungsi, Variabel Teknis, Stores**: Bahasa Inggris (`syncOutbox`, `buildReceipt`, `useCartStore`, `calculateCartTotal`).
- **Komentar Kode**: Bahasa Indonesia yang jelas dan informatif.
- **TypeScript**: Wajib `strict: true`. Dilarang menggunakan `any` kecuali pada batasan parsing JSON yang langsung divalidasi dengan Zod.
